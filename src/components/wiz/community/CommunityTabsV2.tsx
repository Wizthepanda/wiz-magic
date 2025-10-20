import React, { Suspense, useState, useEffect, useRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageSquare, GraduationCap, Trophy, Info, FileText, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import type { Community } from "@/types/community";
import { ModulesList } from "./ModulesList";
import { DiscussionFeed } from "./DiscussionFeed";
import { MembersGrid } from "./MembersGrid";
import { RewardsList } from "./RewardsList";
import { cn } from "@/lib/utils";

interface CommunityTabsV2Props {
  community: Community;
  feedComponent?: React.ReactNode;
}

const tabs = [
  { value: "community", label: "Community", icon: MessageSquare },
  { value: "courses", label: "Courses", icon: GraduationCap },
  { value: "leaderboard", label: "Leaderboard", icon: Trophy },
  { value: "about", label: "About", icon: Info },
  { value: "resources", label: "Resources", icon: FileText },
  { value: "rewards", label: "Rewards", icon: Gift },
];

export function CommunityTabsV2({ community, feedComponent }: CommunityTabsV2Props) {
  const [activeTab, setActiveTab] = useState("community");
  const [notificationCount, setNotificationCount] = useState({ community: 3, rewards: 1 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="bg-transparent">
      {/* Enhanced Tab Bar with Glassmorphism */}
      <div className="sticky top-20 z-20 -mx-6 px-6 py-4 mb-6 backdrop-blur-2xl bg-gradient-to-r from-white/90 via-white/85 to-white/90 border-b border-white/60 shadow-lg">
        <div className="relative">
          {/* Scroll buttons for mobile */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-white/60 flex items-center justify-center md:hidden"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </motion.button>
            )}

            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-white/60 flex items-center justify-center md:hidden"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Tab List with horizontal scroll on mobile */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory md:overflow-visible"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <Tabs.List
              className="flex gap-2 bg-white/50 backdrop-blur-xl rounded-2xl p-1.5 shadow-xl border border-white/70 min-w-max md:min-w-0"
              aria-label="Community sections"
            >
              {tabs.map((tab) => (
                <TabTrigger
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.value}
                  notificationCount={notificationCount[tab.value as keyof typeof notificationCount]}
                />
              ))}
            </Tabs.List>
          </div>
        </div>
      </div>

      {/* Tab Content with animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Tabs.Content value="community" className="mt-0">
            <Suspense fallback={<LoadingSpinner />}>
              {feedComponent || <DiscussionFeed communityId={community.id} />}
            </Suspense>
          </Tabs.Content>

          <Tabs.Content value="courses" className="mt-0">
            <Suspense fallback={<LoadingSpinner />}>
              <ModulesList communityId={community.id} modules={community.modules} />
            </Suspense>
          </Tabs.Content>

          <Tabs.Content value="leaderboard" className="mt-0">
            <Suspense fallback={<LoadingSpinner />}>
              <MembersGrid communityId={community.id} />
            </Suspense>
          </Tabs.Content>

          <Tabs.Content value="about" className="mt-0">
            <AboutPanel community={community} />
          </Tabs.Content>

          <Tabs.Content value="resources" className="mt-0">
            <ResourcesPanel community={community} />
          </Tabs.Content>

          <Tabs.Content value="rewards" className="mt-0">
            <Suspense fallback={<LoadingSpinner />}>
              <RewardsList communityId={community.id} />
            </Suspense>
          </Tabs.Content>
        </motion.div>
      </AnimatePresence>
    </Tabs.Root>
  );
}

function TabTrigger({
  value,
  label,
  icon: Icon,
  isActive,
  notificationCount,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  notificationCount?: number;
}) {
  return (
    <Tabs.Trigger
      value={value}
      className={cn(
        "relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 snap-center",
        "flex items-center gap-2 whitespace-nowrap",
        isActive
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105"
          : "text-slate-700 hover:text-slate-900 hover:bg-white/70 hover:scale-102"
      )}
    >
      {/* Active tab background with animation */}
      {isActive && (
        <motion.div
          layoutId="activeTabBackground"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Icon */}
      <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-white")} />

      {/* Label */}
      <span className="relative z-10">{label}</span>

      {/* Notification badge */}
      {notificationCount && notificationCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "relative z-10 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold",
            isActive
              ? "bg-white text-indigo-600"
              : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
          )}
        >
          {notificationCount}
        </motion.div>
      )}

      {/* Active indicator underline */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Subtle glow on active tab */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-md -z-10"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </Tabs.Trigger>
  );
}

function AboutPanel({ community }: { community: Community }) {
  const description = community.longDescription || community.shortDescription || community.description || "No description available.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Main About Card */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-2xl shadow-2xl border border-white/60">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-5">
          About this community
        </h3>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed text-base">
            {description}
          </p>
        </div>

        {/* Tags */}
        {community.tags && community.tags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200/50">
            <div className="text-sm font-bold text-slate-800 mb-4">Topics</div>
            <div className="flex flex-wrap gap-2">
              {community.tags.map((tag, idx) => (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-sm font-semibold border border-indigo-200/50 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-6 pt-6 border-t border-slate-200/50 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Modules" value={community.modules?.length || 0} />
          <StatCard label="Members" value={community.membersCount || community.slotsClaimed || 0} />
          <StatCard label="Duration" value={community.duration || "Lifetime"} />
          <StatCard label="Access" value={community.accessType || "Free"} />
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl p-5 text-center shadow-lg hover:shadow-2xl transition-all border border-white/60"
    >
      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs text-slate-600 mt-2 font-semibold">{label}</div>
    </motion.div>
  );
}

function ResourcesPanel({ community }: { community: Community }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-2xl shadow-2xl border border-white/60"
    >
      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
        Resources
      </h3>
      <div className="text-center py-16 text-slate-500">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <FileText className="w-10 h-10 text-indigo-600" />
        </motion.div>
        <p className="text-base font-medium text-slate-700">Community resources will be available soon.</p>
        <p className="text-sm mt-2 text-slate-500">Check back later for downloads, guides, and tools.</p>
      </div>
    </motion.div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-indigo-600" />
      </motion.div>
    </div>
  );
}
