import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Rocket,
  ChevronRight,
  Home,
  Plus,
  Upload,
  Youtube,
  Link,
  FileText,
  DollarSign,
  Zap,
  Crown,
  Calendar,
  Check,
  Loader,
  Globe,
  Lock,
  Eye,
  Trash2,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import CommunityPreview from './CommunityPreview';
import {
  createCommunitySchema,
  communityCategories,
  privacyOptions,
  accessWindowOptions,
  type CreateCommunityForm
} from '@/lib/schemas/community';
import { useCreateCommunity, useUpdateCommunity, usePublishCommunity, useSaveDraft } from '@/hooks/useCommunity';

interface CreateCommunityPageProps {
  onBack: () => void;
}

const steps = [
  { id: 1, title: 'Details', icon: FileText },
  { id: 2, title: 'Content', icon: Youtube },
  { id: 3, title: 'Monetize', icon: DollarSign },
  { id: 4, title: 'Publish', icon: Rocket }
];

const CreateCommunityPage: React.FC<CreateCommunityPageProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [coverMedia, setCoverMedia] = useState<Array<{ type: 'image' | 'youtube'; url: string; thumbnail?: string }>>([]);
  const [modules, setModules] = useState<Array<{ title: string; type: 'video' | 'article'; link?: string; duration?: string }>>([]);
  const [downloads, setDownloads] = useState<Array<{ name: string; url: string }>>([]);

  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Form setup with proper schema validation
  const form = useForm<CreateCommunityForm>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      title: '',
      tagline: '',
      category: '',
      coverMedia: [],
      shortDescription: '',
      longDescription: '',
      tags: [],
      privacy: 'public',
      youtubeChannelConnected: false,
      youtubeVideoIds: [],
      modules: [],
      downloads: [],
      zapsRequired: 0,
      usdCoPay: 0,
      slotsAvailable: null,
      subscriptionMonthly: 0,
      splitPayEnabled: false,
      accessWindow: 'lifetime',
      status: 'draft'
    },
    mode: 'onChange'
  });

  // Mutations
  const createCommunity = useCreateCommunity();
  const updateCommunity = useUpdateCommunity();
  const publishCommunity = usePublishCommunity();
  const saveDraft = useSaveDraft();

  // Watch form data for preview
  const watchedData = form.watch();

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (form.formState.isDirty) {
        handleSaveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [form.formState.isDirty]);

  const handleSaveDraft = async () => {
    const formData = form.getValues();
    const draftData = {
      ...formData,
      tags,
      coverMedia,
      modules,
      downloads
    };

    try {
      const result = await saveDraft.mutateAsync({
        id: communityId || undefined,
        data: draftData
      });

      if (!communityId && result.id) {
        setCommunityId(result.id);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  const handleAddCoverMedia = (media: { type: 'image' | 'youtube'; url: string; thumbnail?: string }) => {
    if (coverMedia.length < 5) {
      const updatedMedia = [...coverMedia, media];
      setCoverMedia(updatedMedia);
      form.setValue('coverMedia', updatedMedia);
    }
  };

  const handleRemoveCoverMedia = (index: number) => {
    const updatedMedia = coverMedia.filter((_, i) => i !== index);
    setCoverMedia(updatedMedia);
    form.setValue('coverMedia', updatedMedia);
  };

  const validateCurrentStep = () => {
    const formData = form.getValues();

    switch (currentStep) {
      case 1:
        return !!(formData.title && formData.category && formData.shortDescription);
      case 2:
        return true; // Content step is optional
      case 3:
        return true; // Monetization step is optional (free communities)
      case 4:
        return true; // Publish step
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length && validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePublish = async (publishDate?: Date) => {
    try {
      const formData = form.getValues();
      const communityData = {
        ...formData,
        tags,
        coverMedia,
        modules,
        downloads,
        status: publishDate ? 'scheduled' : 'published'
      };

      let finalCommunityId = communityId;

      // Create community if it doesn't exist
      if (!finalCommunityId) {
        const result = await createCommunity.mutateAsync(communityData);
        finalCommunityId = result.id;
        setCommunityId(result.id);
      } else {
        // Update existing community
        await updateCommunity.mutateAsync({
          id: finalCommunityId,
          data: communityData
        });
      }

      // Publish the community
      await publishCommunity.mutateAsync({
        id: finalCommunityId,
        publishDate
      });

      // Navigate back to create page or show success
      onBack();

    } catch (error) {
      console.error('Error publishing community:', error);
    }
  };

  const isStepValid = validateCurrentStep();
  const canProceed = isStepValid || currentStep === steps.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Breadcrumb */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/90 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 p-1 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Create
            </Button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-gray-900">Community</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stepper */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className={cn(
                            "w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300",
                            currentStep >= step.id
                              ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-500"
                              : "border-gray-300 text-gray-400 bg-gray-50"
                          )}
                          whileHover={{ scale: currentStep >= step.id ? 1.05 : 1 }}
                        >
                          {currentStep > step.id ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <step.icon className="w-5 h-5" />
                          )}
                        </motion.div>
                        {!isMobile && (
                          <div className="text-left">
                            <div className={cn(
                              "font-semibold text-sm",
                              currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                            )}>
                              {step.title}
                            </div>
                          </div>
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={cn(
                          "w-16 h-0.5 mx-4 transition-all duration-300",
                          currentStep > step.id ? "bg-violet-500" : "bg-gray-300"
                        )} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Form Content */}
            <FormProvider {...form}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && <Step1Content
                    tags={tags}
                    newTag={newTag}
                    onNewTagChange={setNewTag}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    coverMedia={coverMedia}
                    onAddCoverMedia={handleAddCoverMedia}
                    onRemoveCoverMedia={handleRemoveCoverMedia}
                  />}
                  {currentStep === 2 && <Step2Content
                    modules={modules}
                    setModules={setModules}
                    downloads={downloads}
                    setDownloads={setDownloads}
                  />}
                  {currentStep === 3 && <Step3Content />}
                  {currentStep === 4 && <Step4Content onPublish={handlePublish} />}
                </motion.div>
              </AnimatePresence>
            </FormProvider>

            {/* Navigation */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {currentStep > 1 && (
                      <Button
                        variant="outline"
                        onClick={handlePrevStep}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      onClick={handleSaveDraft}
                      disabled={saveDraft.isPending}
                      className="flex items-center space-x-2"
                    >
                      {saveDraft.isPending ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Save Draft</span>
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3">
                    {currentStep < steps.length ? (
                      <Button
                        onClick={handleNextStep}
                        disabled={!isStepValid}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 text-white flex items-center space-x-2"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePublish()}
                        disabled={!canProceed || publishCommunity.isPending}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center space-x-2"
                      >
                        {publishCommunity.isPending ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Rocket className="w-4 h-4" />
                        )}
                        <span>Publish Community</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <CommunityPreview
              data={{
                ...watchedData,
                tags,
                coverMedia,
                modules,
                downloads
              }}
              currentStep={currentStep}
              isValid={isStepValid}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 1: Details Component
const Step1Content: React.FC<{
  tags: string[];
  newTag: string;
  onNewTagChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  coverMedia: Array<{ type: 'image' | 'youtube'; url: string; thumbnail?: string }>;
  onAddCoverMedia: (media: { type: 'image' | 'youtube'; url: string; thumbnail?: string }) => void;
  onRemoveCoverMedia: (index: number) => void;
}> = ({ tags, newTag, onNewTagChange, onAddTag, onRemoveTag, coverMedia, onAddCoverMedia, onRemoveCoverMedia }) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Community Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label>Community Title *</Label>
          <Input
            placeholder="e.g., AI Builders Community"
            className="text-lg font-semibold"
          />
          <p className="text-sm text-gray-500">
            Choose a clear, memorable name (5-120 characters)
          </p>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label>Tagline</Label>
          <Input
            placeholder="One-line description of your community"
            maxLength={140}
          />
        </div>

        {/* Category & Privacy Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {communityCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Privacy</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select privacy" />
              </SelectTrigger>
              <SelectContent>
                {privacyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      {option.value === 'public' && <Globe className="w-4 h-4" />}
                      {option.value === 'private' && <Lock className="w-4 h-4" />}
                      {option.value === 'invite' && <Eye className="w-4 h-4" />}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cover Media */}
        <div className="space-y-4">
          <Label>Cover Media (up to 5)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coverMedia.map((media, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {media.type === 'youtube' ? (
                    <div className="w-full h-full bg-red-100 flex items-center justify-center">
                      <Youtube className="w-8 h-8 text-red-500" />
                    </div>
                  ) : (
                    <img
                      src={media.url}
                      alt={`Cover ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => onRemoveCoverMedia(index)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}

            {coverMedia.length < 5 && (
              <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-violet-400 transition-colors">
                <div className="text-center">
                  <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Add media</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <Label>Short Description *</Label>
          <Textarea
            placeholder="Compelling 1-3 line description that explains what members will get..."
            rows={3}
            maxLength={300}
          />
          <p className="text-sm text-gray-500">
            This appears in search results and previews (10-300 characters)
          </p>
        </div>

        {/* Long Description */}
        <div className="space-y-2">
          <Label>About (Optional)</Label>
          <Textarea
            placeholder="Detailed description, community guidelines, what to expect..."
            rows={6}
          />
          <p className="text-sm text-gray-500">
            Rich text formatting coming soon
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              value={newTag}
              onChange={(e) => onNewTagChange(e.target.value)}
              placeholder="Add a tag..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddTag();
                }
              }}
            />
            <Button type="button" onClick={onAddTag} variant="outline">
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Step 2: Content Component
const Step2Content: React.FC<{
  modules: Array<{ title: string; type: 'video' | 'article'; link?: string; duration?: string }>;
  setModules: React.Dispatch<React.SetStateAction<Array<{ title: string; type: 'video' | 'article'; link?: string; duration?: string }>>>;
  downloads: Array<{ name: string; url: string }>;
  setDownloads: React.Dispatch<React.SetStateAction<Array<{ name: string; url: string }>>>;
}> = ({ modules, setModules, downloads, setDownloads }) => {
  return (
    <div className="space-y-6">
      {/* YouTube Connect Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Youtube className="w-5 h-5 text-red-500" />
            <span>YouTube Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Youtube className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="font-semibold mb-2">Connect Your YouTube Channel</h3>
            <p className="text-gray-600 mb-4">
              Import your best videos to showcase in your community
            </p>
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              <Youtube className="w-4 h-4 mr-2" />
              Connect YouTube
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modules/Curriculum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Featured Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.map((module, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <Input
                  value={module.title}
                  onChange={(e) => {
                    const updated = [...modules];
                    updated[index].title = e.target.value;
                    setModules(updated);
                  }}
                  placeholder="Content title"
                  className="flex-1"
                />
                <Select
                  value={module.type}
                  onValueChange={(value: 'video' | 'article') => {
                    const updated = [...modules];
                    updated[index].type = value;
                    setModules(updated);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setModules(modules.filter((_, i) => i !== index));
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={module.link || ''}
                  onChange={(e) => {
                    const updated = [...modules];
                    updated[index].link = e.target.value;
                    setModules(updated);
                  }}
                  placeholder="Link URL"
                />
                <Input
                  value={module.duration || ''}
                  onChange={(e) => {
                    const updated = [...modules];
                    updated[index].duration = e.target.value;
                    setModules(updated);
                  }}
                  placeholder="Duration (e.g., 10 min)"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setModules([...modules, { title: '', type: 'video', link: '', duration: '' }]);
            }}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </CardContent>
      </Card>

      {/* Downloads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Downloadable Resources</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {downloads.map((download, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Input
                  value={download.name}
                  onChange={(e) => {
                    const updated = [...downloads];
                    updated[index].name = e.target.value;
                    setDownloads(updated);
                  }}
                  placeholder="File name"
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setDownloads(downloads.filter((_, i) => i !== index));
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Input
                value={download.url}
                onChange={(e) => {
                  const updated = [...downloads];
                  updated[index].url = e.target.value;
                  setDownloads(updated);
                }}
                placeholder="Download URL"
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDownloads([...downloads, { name: '', url: '' }]);
            }}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Download
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Step 3: Monetize Component
const Step3Content: React.FC = () => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Monetization & Access</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Model */}
        <div className="space-y-4">
          <Label>Pricing Model</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ZAPs Required</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  className="pl-8"
                />
                <Zap className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-violet-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>USD Co-Pay</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                />
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <Label>Member Limit</Label>
          <Input
            type="number"
            placeholder="Unlimited"
          />
          <p className="text-sm text-gray-500">
            Leave empty for unlimited members
          </p>
        </div>

        {/* Access Window */}
        <div className="space-y-2">
          <Label>Access Duration</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select access duration" />
            </SelectTrigger>
            <SelectContent>
              {accessWindowOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Split Pay Toggle */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">
              Enable Split Payment
            </Label>
            <p className="text-sm text-gray-500">
              Allow members to pay with ZAPs OR USD (not both)
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
};

// Step 4: Publish Component
const Step4Content: React.FC<{
  onPublish: (publishDate?: Date) => void;
}> = ({ onPublish }) => {
  const [publishDate, setPublishDate] = useState<string>('');
  const [publishType, setPublishType] = useState<'now' | 'schedule'>('now');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Rocket className="w-5 h-5" />
          <span>Publish Community</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Publish Options */}
        <div className="space-y-4">
          <Label>Publishing Options</Label>
          <RadioGroup value={publishType} onValueChange={(value: 'now' | 'schedule') => setPublishType(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="now" id="now" />
              <Label htmlFor="now">Publish Now</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="schedule" id="schedule" />
              <Label htmlFor="schedule">Schedule for Later</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Schedule Date */}
        {publishType === 'schedule' && (
          <div className="space-y-2">
            <Label>Publish Date & Time</Label>
            <Input
              type="datetime-local"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        )}

        {/* Publish Checklist */}
        <div className="space-y-3">
          <Label>Pre-publish Checklist</Label>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Community details completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Content and resources added</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Pricing and access configured</span>
            </div>
          </div>
        </div>

        {/* Publishing Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Crown className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Publishing Destination</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your community will appear in Community Discovery and be searchable within 5 minutes of publishing.
              </p>
            </div>
          </div>
        </div>

        {/* Final Publish Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={() => onPublish()}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            size="lg"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Publish Now
          </Button>

          {publishType === 'schedule' && publishDate && (
            <Button
              onClick={() => onPublish(new Date(publishDate))}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateCommunityPage;