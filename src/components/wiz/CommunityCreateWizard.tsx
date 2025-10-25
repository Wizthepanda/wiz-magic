import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  BookOpen,
  DollarSign,
  Rocket,
  ArrowLeft,
  ArrowRight,
  Save,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCommunityCreateStore } from '@/store/communityCreateStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Import step components (we'll create these next)
import { StepDetails } from './wizard-steps/StepDetails';
import { StepContent } from './wizard-steps/StepContent';
import { StepMonetization } from './wizard-steps/StepMonetization';
import { StepPublish } from './wizard-steps/StepPublish';
import { CommunityCardPreview } from './wizard-steps/CommunityCardPreview';

interface CommunityCreateWizardProps {
  onBack: () => void;
  draftId?: string;
}

const steps = [
  {
    id: 1,
    title: 'Details',
    subtitle: 'Identity & basics',
    icon: FileText,
    description: 'Set up your community identity'
  },
  {
    id: 2,
    title: 'Content',
    subtitle: 'Courses & rewards',
    icon: BookOpen,
    description: 'Add courses and ZAP rewards'
  },
  {
    id: 3,
    title: 'Monetization',
    subtitle: 'Pricing & access',
    icon: DollarSign,
    description: 'Configure pricing and access'
  },
  {
    id: 4,
    title: 'Publish',
    subtitle: 'Review & launch',
    icon: Rocket,
    description: 'Preview and publish'
  }
];

export const CommunityCreateWizard: React.FC<CommunityCreateWizardProps> = ({
  onBack,
  draftId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useIsMobile();

  const store = useCommunityCreateStore();

  const handleNext = () => {
    if (currentStep < 4) {
      // Validate current step before proceeding
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Validate Details step
        if (!store.title || store.title.length < 5) {
          toast.error('Please enter a title (at least 5 characters)');
          return false;
        }
        if (!store.category) {
          toast.error('Please select a category');
          return false;
        }
        if (!store.description || store.description.length < 10) {
          toast.error('Please enter a description (at least 10 characters)');
          return false;
        }
        return true;
      case 2:
        // Content step is optional
        return true;
      case 3:
        // Monetization step validation
        if (store.pricingModel === 'usd' && store.usdAmount <= 0) {
          toast.error('Please set a USD amount greater than 0');
          return false;
        }
        if (store.pricingModel === 'zaps' && store.zapsRequired <= 0) {
          toast.error('Please set ZAPs required greater than 0');
          return false;
        }
        if (store.pricingModel === 'zaps-usd' && (store.zapsRequired <= 0 || store.usdAmount <= 0)) {
          toast.error('Please set both ZAPs and USD amounts');
          return false;
        }
        if (store.pricingModel === 'crypto' && !store.cryptoAmount) {
          toast.error('Please set a crypto amount');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement draft saving logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      toast.success('Draft saved successfully!');
    } catch (error) {
      toast.error('Failed to save draft');
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <StepDetails />;
      case 2:
        return <StepContent />;
      case 3:
        return <StepMonetization />;
      case 4:
        return <StepPublish onBack={() => setCurrentStep(1)} />;
      default:
        return <StepDetails />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            {/* Save Draft Button */}
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="sticky top-16 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isClickable = currentStep >= step.id;

              return (
                <React.Fragment key={step.id}>
                  {/* Step Item */}
                  <button
                    onClick={() => isClickable && setCurrentStep(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      "flex flex-col items-center space-y-2 transition-all duration-300",
                      "group relative",
                      isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                    )}
                  >
                    {/* Icon Circle */}
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted
                          ? 'rgb(34, 197, 94)' // green-500
                          : isActive
                          ? 'rgb(168, 85, 247)' // purple-500
                          : 'rgb(229, 231, 235)' // gray-200
                      }}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        "shadow-lg transition-all duration-300",
                        isActive && "shadow-purple-500/50 ring-4 ring-purple-200"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <Icon
                          className={cn(
                            "w-6 h-6 transition-colors",
                            isActive ? "text-white" : "text-gray-500"
                          )}
                        />
                      )}
                    </motion.div>

                    {/* Step Info */}
                    <div className="text-center">
                      <p
                        className={cn(
                          "font-semibold text-sm transition-colors",
                          isActive ? "text-purple-600" : "text-gray-600"
                        )}
                      >
                        {step.title}
                      </p>
                      {!isMobile && (
                        <p className="text-xs text-gray-500">{step.subtitle}</p>
                      )}
                    </div>

                    {/* Active Glow Effect */}
                    {isActive && (
                      <motion.div
                        layoutId="activeStep"
                        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-4 relative">
                      <div className="absolute inset-0 bg-gray-200 rounded-full" />
                      <motion.div
                        initial={false}
                        animate={{
                          width: currentStep > step.id ? '100%' : '0%'
                        }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Step Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 bg-white/70 backdrop-blur-xl border-2 border-transparent hover:border-purple-200 transition-all duration-500 shadow-xl rounded-3xl">
                  {/* Step Header */}
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {steps[currentStep - 1].title}
                    </h2>
                    <p className="text-gray-600">{steps[currentStep - 1].description}</p>
                  </div>

                  {/* Step Component */}
                  {getStepComponent()}

                  {/* Navigation Buttons */}
                  {currentStep < 4 && (
                    <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </Button>

                      <Button
                        onClick={handleNext}
                        className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      >
                        <span>Next Step</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Panel: Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <CommunityCardPreview currentStep={currentStep} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
