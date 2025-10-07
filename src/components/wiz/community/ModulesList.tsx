import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Play, Lock, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Module } from "@/types/community";
import { cn } from "@/lib/utils";

interface ModulesListProps {
  communityId: string;
  modules?: Module[];
}

export function ModulesList({ communityId, modules = [] }: ModulesListProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  if (!modules || modules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-12 bg-white/70 backdrop-blur-sm shadow-sm text-center"
      >
        <div className="text-slate-400 mb-3">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-slate-700">No modules yet</h4>
        <p className="text-sm text-slate-500 mt-2">Check back soon for learning content</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module, idx) => {
        const isExpanded = expandedModules.has(module.id);
        const progress = module.progress || 0;
        
        return (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden"
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full p-5 flex items-center justify-between hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white",
                  "bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]"
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 text-base mb-1">
                    {module.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{module.lessons?.length || 0} lessons</span>
                    {module.duration && (
                      <>
                        <span>•</span>
                        <span>{module.duration}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="text-[#8B5CF6] font-medium">{progress}% complete</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Progress Ring */}
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-slate-200"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${progress * 1.256} 125.6`}
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-700">
                    {progress}%
                  </div>
                </div>

                {/* Expand Icon */}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </motion.div>
              </div>
            </button>

            {/* Lessons List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-2">
                    {module.lessons?.map((lesson, lessonIdx) => (
                      <LessonCard 
                        key={lesson.id} 
                        lesson={lesson} 
                        index={lessonIdx}
                        moduleId={module.id}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function LessonCard({ 
  lesson, 
  index,
  moduleId 
}: { 
  lesson: any; 
  index: number;
  moduleId: string;
}) {
  const isLocked = false; // TODO: Implement lock logic based on prerequisites
  const isCompleted = lesson.completed || false;

  const handlePlayLesson = () => {
    if (isLocked) return;
    
    // If lesson has a URL (video/article), open it
    if (lesson.url) {
      window.open(lesson.url, '_blank');
    } else {
      console.log('Playing lesson:', lesson.title);
      // TODO: Implement lesson player/viewer
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center justify-between bg-white rounded-lg p-4 shadow-sm",
        "hover:shadow-md transition-all",
        isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      )}
      onClick={isLocked ? undefined : handlePlayLesson}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Status Icon */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isCompleted ? "bg-green-100" : isLocked ? "bg-slate-100" : "bg-[#8B5CF6]/10"
        )}>
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : isLocked ? (
            <Lock className="w-4 h-4 text-slate-400" />
          ) : (
            <Play className="w-4 h-4 text-[#8B5CF6]" />
          )}
        </div>

        {/* Lesson Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 text-sm truncate">
            {lesson.title}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>{lesson.duration}</span>
            {lesson.type && (
              <>
                <span>•</span>
                <span className="capitalize">{lesson.type}</span>
              </>
            )}
          </div>
        </div>

        {/* ZAP Reward */}
        {lesson.zaps && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 flex-shrink-0">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-semibold">+{lesson.zaps}</span>
          </div>
        )}

        {/* Play Button */}
        <Button
          size="sm"
          disabled={isLocked}
          onClick={(e) => {
            e.stopPropagation();
            handlePlayLesson();
          }}
          className={cn(
            "rounded-lg font-semibold flex-shrink-0",
            isCompleted 
              ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" 
              : "bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:shadow-md"
          )}
        >
          {isCompleted ? 'Replay' : isLocked ? 'Locked' : 'Start'}
        </Button>
      </div>
    </motion.div>
  );
}

