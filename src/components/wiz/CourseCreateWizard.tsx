import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCourseCreateStore } from '@/store/courseCreateStore';
import { debounce } from 'lodash';
import { FileText, Palette, BookOpen, Rocket, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { StepCourseDetails } from './course-wizard/StepCourseDetails';
import { StepCourseBranding } from './course-wizard/StepCourseBranding';
import { StepCourseCurriculum } from './course-wizard/StepCourseCurriculum';
import { StepCoursePublish } from './course-wizard/StepCoursePublish';

const STEPS = [
  { id: 1, title: 'Details', icon: FileText, component: StepCourseDetails },
  { id: 2, title: 'Branding', icon: Palette, component: StepCourseBranding },
  { id: 3, title: 'Curriculum', icon: BookOpen, component: StepCourseCurriculum },
  { id: 4, title: 'Publish', icon: Rocket, component: StepCoursePublish },
];

interface CourseCreateWizardProps {
  onBack?: () => void;
}

export const CourseCreateWizard: React.FC<CourseCreateWizardProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const store = useCourseCreateStore();
  
  // Load draft for current user on mount/auth change
  useEffect(() => {
    if (user?.uid) {
      console.log('👤 User authenticated, loading course draft for:', user.uid);
      store.loadDraftForUser(user.uid);
    } else {
      console.log('👤 No user, resetting course draft to defaults');
      store.loadDraftForUser(null);
    }
  }, [user?.uid]);
  
  // Debounced persist to localStorage
  const debouncedPersist = useMemo(
    () => debounce(() => {
      if (user?.uid) {
        store.persistDraftToStorage();
      }
    }, 700),
    [user?.uid]
  );
  
  // Auto-save on store changes
  useEffect(() => {
    // Only persist if we have a user and at least a title
    if (user?.uid && store.title) {
      debouncedPersist();
    }
    
    return () => {
      debouncedPersist.cancel();
    };
  }, [
    store.title,
    store.shortDescription,
    store.category,
    store.difficulty,
    store.coverURL,
    store.modules,
    store.themeColor,
    debouncedPersist,
    user?.uid
  ]);
  
  // Persist on unmount
  useEffect(() => {
    return () => {
      if (user?.uid) {
        store.persistDraftToStorage();
      }
    };
  }, [user?.uid]);
  
  const currentStepConfig = STEPS.find(s => s.id === currentStep);
  const CurrentStepComponent = currentStepConfig?.component || StepCourseDetails;
  
  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onBack) {
      onBack();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f7f9fc] to-[#eef1f7]">
      {/* Header with Step Progress */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create Course</h1>
                <p className="text-sm text-gray-600">Step {currentStep} of {STEPS.length}</p>
              </div>
            </div>
            
            {/* Save Indicator */}
            {user?.uid && store.title && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Auto-saving...</span>
              </div>
            )}
          </div>
          
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1",
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-lg"
                        : isCompleted
                        ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <StepIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm hidden sm:inline">
                      {step.title}
                    </span>
                  </button>
                  
                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CurrentStepComponent />
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleBack}
              variant="outline"
              className="px-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button
              onClick={handleNext}
              className="px-6 bg-gradient-to-r from-indigo-600 to-violet-500"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
        
        {/* Back button on final step */}
        {currentStep === 4 && (
          <div className="flex justify-start mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleBack}
              variant="outline"
              className="px-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

