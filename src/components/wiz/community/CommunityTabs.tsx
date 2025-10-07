import React, { Suspense } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="bg-transparent">
      <div className="flex items-center justify-between mb-6">
        <Tabs.List className="flex gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-1.5 shadow-sm" aria-label="Community sections">
          <TabTrigger value="overview" isActive={activeTab === "overview"}>
            Overview
          </TabTrigger>
          <TabTrigger value="modules" isActive={activeTab === "modules"}>
            Modules
          </TabTrigger>
          <TabTrigger value="discussions" isActive={activeTab === "discussions"}>
            Discussions
          </TabTrigger>
          <TabTrigger value="members" isActive={activeTab === "members"}>
            Members
          </TabTrigger>
          <TabTrigger value="resources" isActive={activeTab === "resources"}>
            Resources
          </TabTrigger>
          <TabTrigger value="rewards" isActive={activeTab === "rewards"}>
            Rewards
          </TabTrigger>
        </Tabs.List>
      </div>

      <Tabs.Content value="overview" className="mt-0">
        <OverviewPanel community={community} />
      </Tabs.Content>

      <Tabs.Content value="modules" className="mt-0">
        <Suspense fallback={<LoadingSpinner />}>
          <ModulesList communityId={community.id} modules={community.modules} />
        </Suspense>
      </Tabs.Content>

      <Tabs.Content value="discussions" className="mt-0">
        <Suspense fallback={<LoadingSpinner />}>
          <DiscussionFeed communityId={community.id} />
        </Suspense>
      </Tabs.Content>

      <Tabs.Content value="members" className="mt-0">
        <Suspense fallback={<LoadingSpinner />}>
          <MembersGrid communityId={community.id} />
        </Suspense>
      </Tabs.Content>

      <Tabs.Content value="resources" className="mt-0">
        <ResourcesPanel community={community} />
      </Tabs.Content>

      <Tabs.Content value="rewards" className="mt-0">
        <Suspense fallback={<LoadingSpinner />}>
          <RewardsList communityId={community.id} />
        </Suspense>
      </Tabs.Content>
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
        "relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
        isActive 
          ? "bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md" 
          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
      )}
    >
      {children}
    </Tabs.Trigger>
  );
}

function OverviewPanel({ community }: { community: Community }) {
  const description = community.longDescription || community.shortDescription || community.description || "No description available.";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl p-6 md:p-8 bg-white/70 backdrop-blur-sm shadow-sm"
    >
      <h3 className="text-xl font-bold text-slate-900 mb-4">About this community</h3>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-700 leading-relaxed text-base">
          {description}
        </p>
      </div>

      {/* Tags */}
      {community.tags && community.tags.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="text-sm font-semibold text-slate-700 mb-3">Topics</div>
          <div className="flex flex-wrap gap-2">
            {community.tags.map((tag, idx) => (
              <span 
                key={idx}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 text-[#8B5CF6] text-xs font-medium border border-[#8B5CF6]/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
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
    <div className="bg-white/60 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function ResourcesPanel({ community }: { community: Community }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl p-6 md:p-8 bg-white/70 backdrop-blur-sm shadow-sm"
    >
      <h3 className="text-xl font-bold text-slate-900 mb-4">Resources</h3>
      <div className="text-center py-12 text-slate-500">
        <p className="text-sm">Community resources will be available soon.</p>
        <p className="text-xs mt-2">Check back later for downloads, guides, and tools.</p>
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

