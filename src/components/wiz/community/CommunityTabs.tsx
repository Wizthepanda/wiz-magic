import React, { Suspense, useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { Loader2, BookOpen, GraduationCap, PlayCircle, ChevronRight } from "lucide-react";
import type { Community } from "@/types/community";
import { ModulesList } from "./ModulesList";
import { DiscussionFeed } from "./DiscussionFeed";
import { MembersGrid } from "./MembersGrid";
import { RewardsList } from "./RewardsList";
import { cn } from "@/lib/utils";
import { CourseService, type Course } from "@/lib/course-service";

interface CommunityTabsProps {
  community: Community;
}

export function CommunityTabs({ community }: CommunityTabsProps) {
  const [activeTab, setActiveTab] = React.useState("community");

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="bg-transparent">
      {/* Sticky glassy filter bar */}
      <div className="sticky top-20 z-20 -mx-6 px-6 py-4 mb-6 bg-gradient-to-r from-white/80 via-white/70 to-white/80 bg-clip-padding backdrop-filter backdrop-blur-md will-change-transform border-b border-white/40">
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
  const [linkedCourse, setLinkedCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(false);

  // Fetch linked course if exists
  useEffect(() => {
    const fetchLinkedCourse = async () => {
      if (!community.linkedCourseId) return;

      setLoadingCourse(true);
      try {
        const courseService = CourseService.getInstance();

        // Try to get from both collections
        const [learnSnapshot, claimSnapshot] = await Promise.all([
          import('firebase/firestore').then(({ getDoc, doc }) =>
            getDoc(doc(import('@/lib/firebase').then(m => m.db), 'courses_learn', community.linkedCourseId!))
          ),
          import('firebase/firestore').then(({ getDoc, doc }) =>
            getDoc(doc(import('@/lib/firebase').then(m => m.db), 'courses_claim', community.linkedCourseId!))
          )
        ]);

        const learnDoc = await learnSnapshot;
        const claimDoc = await claimSnapshot;

        if (learnDoc.exists()) {
          setLinkedCourse({ id: learnDoc.id, ...learnDoc.data() } as Course);
        } else if (claimDoc.exists()) {
          setLinkedCourse({ id: claimDoc.id, ...claimDoc.data() } as Course);
        }
      } catch (error) {
        console.error('Error fetching linked course:', error);
      } finally {
        setLoadingCourse(false);
      }
    };

    fetchLinkedCourse();
  }, [community.linkedCourseId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Featured Course Card */}
      {community.linkedCourseId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 backdrop-blur-xl shadow-2xl border-2 border-violet-200 relative overflow-hidden"
        >
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400/20 to-purple-400/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-violet-600 uppercase tracking-wider">Featured Course</h3>
                <p className="text-xs text-violet-500">Included with membership</p>
              </div>
            </div>

            {loadingCourse ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
              </div>
            ) : linkedCourse ? (
              <>
                <h4 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                  {linkedCourse.title}
                </h4>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {linkedCourse.description}
                </p>

                {/* Course stats */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-violet-200">
                    <BookOpen className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      {linkedCourse.modules?.length || 0} Modules
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-violet-200">
                    <PlayCircle className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      {linkedCourse.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0} Lessons
                    </span>
                  </div>
                  {linkedCourse.enrollmentCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-violet-200">
                      <GraduationCap className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        {linkedCourse.enrollmentCount} Students
                      </span>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Start Learning
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </>
            ) : (
              <p className="text-slate-600">Loading course information...</p>
            )}
          </div>
        </motion.div>
      )}

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: community.linkedCourseId ? 0.2 : 0 }}
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

