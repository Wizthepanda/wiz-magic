import React, { Suspense } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { Loader2, BookOpen } from "lucide-react";
import type { Community } from "@/types/community";
import { ModulesList } from "./ModulesList";
import { DiscussionFeed } from "./DiscussionFeed";
import { MembersGrid } from "./MembersGrid";
import { RewardsList } from "./RewardsList";
import { cn } from "@/lib/utils";

interface CommunityTabsProps {
  community: Community;
}

export function CommunityTabs({ community }: CommunityTabsProps) {
  const [activeTab, setActiveTab] = React.useState("community");

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="bg-transparent">
      {/* Sticky glassy filter bar */}
      <div className="sticky top-20 z-20 -mx-6 px-6 py-4 mb-6 backdrop-blur-xl bg-gradient-to-r from-white/80 via-white/70 to-white/80 border-b border-white/40">
        <Tabs.List className="flex gap-2 bg-white/40 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-white/60" aria-label="Community sections">
          <TabTrigger value="community" isActive={activeTab === "community"}>
            Community
          </TabTrigger>
          <TabTrigger value="courses" isActive={activeTab === "courses"}>
            Courses
          </TabTrigger>
          <TabTrigger value="leaderboard" isActive={activeTab === "leaderboard"}>
            Leaderboard
          </TabTrigger>
          <TabTrigger value="about" isActive={activeTab === "about"}>
            About
          </TabTrigger>
          <TabTrigger value="resources" isActive={activeTab === "resources"}>
            Resources
          </TabTrigger>
          <TabTrigger value="rewards" isActive={activeTab === "rewards"}>
            Rewards
          </TabTrigger>
        </Tabs.List>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Tabs.Content value="community" className="mt-0">
          <Suspense fallback={<LoadingSpinner />}>
            <DiscussionFeed communityId={community.id} />
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
    </Tabs.Root>
  );
}

function TabTrigger({ 
  children, 
  value, 
  isActive 
}: { 
  children: React.ReactNode; 
  value: string;
  isActive: boolean;
}) {
  return (
    <Tabs.Trigger 
      value={value} 
      className={cn(
        "relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
        isActive 
          ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg scale-105" 
          : "text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-white/80 hover:to-white/60 hover:scale-102"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] -z-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className={cn(
        "relative z-10",
        isActive && "bg-gradient-to-r from-white to-white/90 bg-clip-text"
      )}>
        {children}
      </span>
      {isActive && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full shadow-md"
          layoutId="activeIndicator"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
      className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl shadow-xl border border-white/40"
    >
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
        <div className="mt-6 pt-6 border-t border-gradient-to-r from-transparent via-slate-200 to-transparent">
          <div className="text-sm font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {community.tags.map((tag, idx) => (
              <motion.span 
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 text-[#8B5CF6] text-sm font-semibold border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/50 transition-all cursor-pointer"
              >
                #{tag}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mt-6 pt-6 border-t border-gradient-to-r from-transparent via-slate-200 to-transparent grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Modules" value={community.modules?.length || 0} />
        <StatCard label="Members" value={community.membersCount || community.slotsClaimed || 0} />
        <StatCard label="Duration" value={community.duration || "Lifetime"} />
        <StatCard label="Access" value={community.accessType} />
      </div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-5 text-center shadow-md hover:shadow-xl transition-shadow border border-white/40"
    >
      <div className="text-3xl font-bold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">{value}</div>
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
      className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl shadow-xl border border-white/40"
    >
      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">Resources</h3>
      <div className="text-center py-16 text-slate-500">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-[#8B5CF6]" />
        </div>
        <p className="text-base font-medium text-slate-700">Community resources will be available soon.</p>
        <p className="text-sm mt-2 text-slate-500">Check back later for downloads, guides, and tools.</p>
      </div>
    </motion.div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
    </div>
  );
}

