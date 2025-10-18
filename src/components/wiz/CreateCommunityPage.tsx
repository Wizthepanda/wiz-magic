import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  CheckCircle,
  Loader,
  Globe,
  Lock,
  Eye,
  Trash2,
  GripVertical,
  Info,
  Bitcoin,
  Coins,
  Gift,
  BookOpen,
  X
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { useCreateCommunity, useUpdateCommunity, usePublishCommunity, useSaveDraft, useCommunity } from '@/hooks/useCommunity';
import { CourseService, type Course } from '@/lib/course-service';
import { CommunityService } from '@/lib/community-service';
import { useAuth } from '@/hooks/useAuth';

interface CreateCommunityPageProps {
  onBack: () => void;
  draftId?: string;
}

const steps = [
  { id: 1, title: 'Details', icon: FileText },
  { id: 2, title: 'Content', icon: BookOpen },
  { id: 3, title: 'Monetize', icon: DollarSign },
  { id: 4, title: 'Publish', icon: Rocket }
];

const CreateCommunityPage: React.FC<CreateCommunityPageProps> = ({ onBack, draftId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [communityId, setCommunityId] = useState<string | null>(draftId || null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [coverMedia, setCoverMedia] = useState<Array<{ type: 'image' | 'youtube'; url: string; thumbnail?: string }>>([]);
  const [modules, setModules] = useState<Array<{ title: string; type: 'video' | 'article'; link?: string; duration?: string }>>([]);
  const [downloads, setDownloads] = useState<Array<{ name: string; url: string }>>([]);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const coverMediaRef = useRef<Array<{ type: 'image' | 'youtube'; url: string; thumbnail?: string }>>([]);

  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Load draft if draftId is provided
  const { data: draftData, isLoading: isDraftLoading } = useCommunity(draftId || '');

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
      linkedCourseId: undefined,
      linkedCourseName: undefined,
      modules: [],
      downloads: [],
      pricingModel: 'free',
      zapsRequired: 0,
      usdCoPay: 0,
      slotsAvailable: null,
      subscriptionMonthly: 0,
      splitPayEnabled: false,
      waitlistEnabled: false,
      accessWindow: 'lifetime',
      offerZAPsToNewMembers: false,
      newMemberZAPsReward: 0,
      cryptoTypes: [],
      cryptoAmount: '',
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

  // Load draft data when available - ONLY ONCE to prevent overwriting user edits
  useEffect(() => {
    if (draftData && draftId && !draftLoaded) {
      console.log('📥 Loading draft data for the first time:', draftId);

      // Populate form with draft data
      form.reset({
        title: draftData.title || '',
        tagline: draftData.tagline || '',
        category: draftData.category || '',
        coverMedia: draftData.coverMedia || [],
        shortDescription: draftData.shortDescription || '',
        longDescription: draftData.longDescription || '',
        tags: draftData.tags || [],
        privacy: draftData.privacy || 'public',
        linkedCourseId: draftData.linkedCourseId || undefined,
        linkedCourseName: draftData.linkedCourseName || undefined,
        modules: draftData.modules || [],
        downloads: draftData.downloads || [],
        pricingModel: draftData.pricingModel || 'free',
        zapsRequired: draftData.zapsRequired || 0,
        usdCoPay: draftData.usdCoPay || 0,
        slotsAvailable: draftData.slotsAvailable || null,
        subscriptionMonthly: draftData.subscriptionMonthly || 0,
        splitPayEnabled: draftData.splitPayEnabled || false,
        waitlistEnabled: draftData.waitlistEnabled || false,
        accessWindow: draftData.accessWindow || 'lifetime',
        offerZAPsToNewMembers: draftData.offerZAPsToNewMembers || false,
        newMemberZAPsReward: draftData.newMemberZAPsReward || 0,
        status: 'draft'
      });

      // Set state for arrays
      setTags(draftData.tags || []);
      setCoverMedia(draftData.coverMedia || []);
      setModules(draftData.modules || []);
      setDownloads(draftData.downloads || []);

      // Mark as loaded to prevent reloading
      setDraftLoaded(true);

      toast({
        title: "Draft loaded!",
        description: "Continue editing your community.",
      });
    }
  }, [draftData, draftId, draftLoaded]);

  // Sync coverMedia state with form whenever it changes
  useEffect(() => {
    coverMediaRef.current = coverMedia;
    form.setValue('coverMedia', coverMedia);
  }, [coverMedia, form]);

  const handleSaveDraft = async (silent = true) => {
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
        data: draftData,
        silent // Pass silent flag to control toast notifications
      });

      // Update communityId if this was a new draft
      if (!communityId && result.id) {
        console.log('💾 Setting communityId for future auto-saves:', result.id);
        setCommunityId(result.id);
      }
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  };

  // Debounced auto-save - saves 5 seconds after user stops typing (silent mode)
  const debouncedAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (form.formState.isDirty) {
        console.log('💾 Auto-saving draft...');
        handleSaveDraft(true); // Silent auto-save
      }
    }, 5000); // 5 second delay - reduced frequency
  };

  // Trigger debounced save when data changes
  useEffect(() => {
    // Only auto-save if we have a communityId or if user has entered at least a title
    const hasMinimumData = communityId || watchedData.title?.length > 0;

    if (hasMinimumData) {
      debouncedAutoSave();
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [watchedData, tags, coverMedia, modules, downloads]);

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

  const handleReorderCoverMedia = (newOrder: typeof coverMedia) => {
    setCoverMedia(newOrder);
    form.setValue('coverMedia', newOrder);
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
                <div className="w-full max-w-4xl mx-auto">
                  <div className="flex items-center justify-between relative">
                    {steps.map((step, index) => (
                      <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center relative z-10">
                          <motion.div
                            className={cn(
                              "w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 bg-white",
                              currentStep >= step.id
                                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-500 shadow-md"
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
                            <div className="mt-2 text-center">
                              <div className={cn(
                                "font-semibold text-sm whitespace-nowrap transition-colors",
                                currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                              )}>
                                {step.title}
                              </div>
                            </div>
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div className="flex-1 mx-3 relative" style={{ top: isMobile ? '0' : '-12px' }}>
                            <div className={cn(
                              "h-0.5 w-full transition-all duration-300",
                              currentStep > step.id ? "bg-violet-500" : "bg-gray-300"
                            )} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
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
                    onReorderCoverMedia={handleReorderCoverMedia}
                  />}
                  {currentStep === 2 && <Step2Content
                    modules={modules}
                    setModules={setModules}
                    downloads={downloads}
                    setDownloads={setDownloads}
                    communityId={communityId}
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
                      onClick={() => handleSaveDraft(false)}
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

// Sortable Media Item Component
const SortableMediaItem: React.FC<{
  id: string;
  media: { type: 'image' | 'youtube'; url: string; thumbnail?: string };
  index: number;
  onRemove: () => void;
}> = ({ id, media, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </div>

      {/* Media Preview */}
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {media.type === 'youtube' ? (
          media.thumbnail ? (
            <div className="relative w-full h-full">
              <img
                src={media.thumbnail}
                alt={`Video ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <Youtube className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-red-100 flex items-center justify-center">
              <Youtube className="w-8 h-8 text-red-500" />
            </div>
          )
        ) : (
          <img
            src={media.url}
            alt={`Cover ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Position Badge */}
      <div className="absolute top-2 right-12 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md">
        #{index + 1}
      </div>

      {/* Remove Button */}
      <Button
        size="sm"
        variant="destructive"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
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
  onReorderCoverMedia: (newOrder: Array<{ type: 'image' | 'youtube'; url: string; thumbnail?: string }>) => void;
}> = ({ tags, newTag, onNewTagChange, onAddTag, onRemoveTag, coverMedia, onAddCoverMedia, onRemoveCoverMedia, onReorderCoverMedia }) => {
  const { register, control, formState: { errors } } = useFormContext<CreateCommunityForm>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUrlError, setVideoUrlError] = useState('');
  const { toast } = useToast();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = coverMedia.findIndex((_, i) => `media-${i}` === active.id);
      const newIndex = coverMedia.findIndex((_, i) => `media-${i}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(coverMedia, oldIndex, newIndex);
        onReorderCoverMedia(newOrder);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Get current media count
    const currentCount = coverMedia.length;
    const remainingSlots = 5 - currentCount;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length < files.length) {
      toast({
        title: "Upload limit",
        description: `Only ${remainingSlots} image(s) can be added (max 5 total).`,
        variant: "destructive"
      });
    }

    const uploadedUrls: Array<{ type: 'image'; url: string; thumbnail: string }> = [];

    // Upload each file
    for (const file of filesToUpload) {
      // Validate file size (max 5MB for better quality)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Max size is 5MB.`,
          variant: "destructive"
        });
        continue;
      }

      try {
        // Import storage dynamically to avoid import issues
        const { storage } = await import('@/lib/firebase');
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const filename = `community-covers/${timestamp}-${random}-${file.name}`;
        const storageRef = ref(storage, filename);

        console.log('📤 Uploading image:', filename);

        // Upload file to Firebase Storage
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        console.log('✅ Image uploaded successfully:', downloadUrl);

        uploadedUrls.push({
          type: 'image',
          url: downloadUrl,
          thumbnail: downloadUrl
        });

      } catch (error) {
        console.error('❌ Error uploading image:', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive"
        });
      }
    }

    // Add all uploaded URLs to coverMedia
    if (uploadedUrls.length > 0) {
      uploadedUrls.forEach(url => {
        onAddCoverMedia(url);
      });

      toast({
        title: "Images uploaded!",
        description: `Successfully uploaded ${uploadedUrls.length} image(s).`,
      });
    }

    // Reset file input
    e.target.value = '';
  };

  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  // Extract Vimeo video ID
  const extractVimeoId = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleAddVideoUrl = () => {
    setVideoUrlError('');

    if (!videoUrl.trim()) {
      setVideoUrlError('Please enter a video URL');
      return;
    }

    const youtubeId = extractYouTubeId(videoUrl);
    const vimeoId = extractVimeoId(videoUrl);

    if (youtubeId) {
      // YouTube video
      onAddCoverMedia({
        type: 'youtube',
        url: `https://www.youtube.com/embed/${youtubeId}`,
        thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      });
      setShowVideoDialog(false);
      setVideoUrl('');
      toast({
        title: "Video added!",
        description: "YouTube video has been added to cover media.",
      });
    } else if (vimeoId) {
      // Vimeo video
      onAddCoverMedia({
        type: 'youtube', // Using 'youtube' type for all videos
        url: `https://player.vimeo.com/video/${vimeoId}`,
        thumbnail: `https://vumbnail.com/${vimeoId}.jpg`
      });
      setShowVideoDialog(false);
      setVideoUrl('');
      toast({
        title: "Video added!",
        description: "Vimeo video has been added to cover media.",
      });
    } else {
      setVideoUrlError('Please enter a valid YouTube or Vimeo URL');
    }
  };

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
            {...register('title')}
            placeholder="e.g., AI Builders Community"
            className="text-lg font-semibold"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
          <p className="text-sm text-gray-500">
            Choose a clear, memorable name (5-120 characters)
          </p>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label>Tagline</Label>
          <Input
            {...register('tagline')}
            placeholder="One-line description of your community"
            maxLength={140}
          />
        </div>

        {/* Category & Privacy Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
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
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Privacy</Label>
            <Controller
              name="privacy"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
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
              )}
            />
          </div>
        </div>

        {/* Cover Media */}
        <div className="space-y-4">
          <Label>Cover Media (up to 5) - Drag to reorder</Label>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={coverMedia.map((_, i) => `media-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coverMedia.map((media, index) => (
                  <SortableMediaItem
                    key={`media-${index}`}
                    id={`media-${index}`}
                    media={media}
                    index={index}
                    onRemove={() => onRemoveCoverMedia(index)}
                  />
                ))}

                {coverMedia.length < 5 && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-violet-400 transition-colors">
                          <div className="text-center">
                            <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500">Add media</p>
                          </div>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Images
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowVideoDialog(true)}>
                          <Youtube className="w-4 h-4 mr-2" />
                          Add Video URL
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Video URL Dialog */}
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Video URL</DialogTitle>
              <DialogDescription>
                Enter a YouTube or Vimeo video URL to add to your community's cover media.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoUrlError('');
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVideoUrl();
                    }
                  }}
                />
                {videoUrlError && (
                  <p className="text-sm text-red-500">{videoUrlError}</p>
                )}
                <p className="text-xs text-gray-500">
                  Supported: YouTube (watch, shorts, youtu.be) and Vimeo URLs
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowVideoDialog(false);
                setVideoUrl('');
                setVideoUrlError('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddVideoUrl}>
                Add Video
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Short Description */}
        <div className="space-y-2">
          <Label>Short Description *</Label>
          <Textarea
            {...register('shortDescription')}
            placeholder="Compelling 1-3 line description that explains what members will get..."
            rows={3}
            maxLength={300}
          />
          {errors.shortDescription && (
            <p className="text-sm text-red-500">{errors.shortDescription.message}</p>
          )}
          <p className="text-sm text-gray-500">
            This appears in search results and previews (10-300 characters)
          </p>
        </div>

        {/* Long Description */}
        <div className="space-y-2">
          <Label>About (Optional)</Label>
          <Textarea
            {...register('longDescription')}
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
  communityId: string | null;
}> = ({ modules, setModules, downloads, setDownloads, communityId }) => {
  const { control, watch, setValue } = useFormContext<CreateCommunityForm>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const linkedCourseId = watch('linkedCourseId');
  const linkedCourseName = watch('linkedCourseName');

  // Fetch user's courses when component mounts
  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!user?.uid) return;

      setLoadingCourses(true);
      try {
        const courseService = CourseService.getInstance();
        const courses = await courseService.getUserCourses(user.uid);
        // Only show published courses
        const publishedCourses = courses.filter(c => c.status === 'published');
        setUserCourses(publishedCourses);
      } catch (error) {
        console.error('Error fetching user courses:', error);
        toast({
          title: "Failed to load courses",
          description: "Could not fetch your courses. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchUserCourses();
  }, [user?.uid]);

  const handleConnectCourse = async () => {
    if (!selectedCourse) {
      toast({
        title: "No course selected",
        description: "Please select a course to connect.",
        variant: "destructive"
      });
      return;
    }

    const course = userCourses.find(c => c.id === selectedCourse);
    if (!course) return;

    setValue('linkedCourseId', course.id);
    setValue('linkedCourseName', course.title);

    // Sync course content if community exists
    if (communityId && course.id) {
      try {
        const communityService = CommunityService.getInstance();
        await communityService.syncCourseToComm(communityId, course.id);

        // Setup real-time sync listener
        communityService.setupCourseSync(course.id);

        toast({
          title: "Course linked successfully!",
          description: `${course.title} is now connected and syncing with this community.`,
        });
      } catch (error) {
        console.error('Error syncing course:', error);
        toast({
          title: "Link succeeded but sync failed",
          description: "Course is linked but content may need manual refresh.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Course linked!",
        description: `${course.title} will be synced when you save the community.`,
      });
    }
  };

  const handleDisconnectCourse = () => {
    setValue('linkedCourseId', undefined);
    setValue('linkedCourseName', undefined);
    setSelectedCourse('');

    toast({
      title: "Course disconnected",
      description: "The course has been removed from this community.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Connect Course Card */}
      <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-violet-600" />
            <span>Connect Course</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {linkedCourseId ? (
            // Show connected course
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 border-2 border-violet-300 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-lg text-gray-900">Course Connected</h3>
                    </div>
                    <p className="text-violet-700 font-medium mb-1">{linkedCourseName}</p>
                    <p className="text-sm text-gray-600">
                      All course lessons and content will sync automatically with this community.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDisconnectCourse}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Disconnect
                </Button>
              </div>
            </motion.div>
          ) : (
            // Show course selection
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-violet-500" />
              </motion.div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Connect Your Course</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Seamlessly link one of your existing courses to this community. All lessons and content will sync automatically.
              </p>

              {loadingCourses ? (
                <div className="flex items-center justify-center space-x-2 text-violet-600">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Loading your courses...</span>
                </div>
              ) : userCourses.length > 0 ? (
                <div className="max-w-md mx-auto space-y-4">
                  <Select onValueChange={setSelectedCourse} value={selectedCourse}>
                    <SelectTrigger className="w-full bg-white border-2 border-violet-300 hover:border-violet-400 transition-colors">
                      <SelectValue placeholder="Select a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id!}>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-violet-500" />
                            <span>{course.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleConnectCourse}
                    disabled={!selectedCourse}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl py-6 font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Connect Course
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-500 text-sm">You haven't created any courses yet.</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/create'}
                    className="border-2 border-violet-300 text-violet-700 hover:bg-violet-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Course
                  </Button>
                </div>
              )}
            </div>
          )}
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

// Step 3: Monetize Component - Enhanced with 6 Pricing Models
const Step3Content: React.FC = () => {
  const { register, control, watch, setValue } = useFormContext<CreateCommunityForm>();
  const { toast } = useToast();

  const pricingModel = watch('pricingModel');
  const splitPayEnabled = watch('splitPayEnabled');
  const waitlistEnabled = watch('waitlistEnabled');
  const offerZAPsToNewMembers = watch('offerZAPsToNewMembers');
  const cryptoTypes = watch('cryptoTypes') || [];

  // Pricing model configuration
  const pricingModels = [
    {
      id: 'free',
      label: 'Free',
      icon: Gift,
      description: 'Free community access',
      gradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'free-zaps',
      label: 'Free ZAPs',
      icon: Zap,
      description: 'Reward new members with ZAPs',
      gradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      id: 'usd',
      label: 'USD Pay',
      icon: DollarSign,
      description: 'Members pay in USD only',
      gradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600'
    },
    {
      id: 'zaps',
      label: 'ZAPs Pay',
      icon: Zap,
      description: 'Members pay with ZAPs only',
      gradient: 'from-violet-50 to-purple-50',
      borderColor: 'border-violet-200',
      iconColor: 'text-violet-600'
    },
    {
      id: 'zaps-usd',
      label: 'ZAPs + USD',
      icon: Coins,
      description: 'Combination of ZAPs and USD',
      gradient: 'from-indigo-50 to-blue-50',
      borderColor: 'border-indigo-200',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'crypto',
      label: 'Crypto',
      icon: Bitcoin,
      description: 'USDT / BTC / USDC / DOGE',
      gradient: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600'
    }
  ];

  const cryptoOptions = [
    { value: 'usdt', label: 'USDT', color: 'bg-green-100 text-green-800' },
    { value: 'btc', label: 'BTC', color: 'bg-orange-100 text-orange-800' },
    { value: 'usdc', label: 'USDC', color: 'bg-blue-100 text-blue-800' },
    { value: 'doge', label: 'DOGE', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const handlePricingModelChange = (newModel: string) => {
    setValue('pricingModel', newModel as any);

    // Reset related fields based on model
    if (newModel === 'free') {
      setValue('usdCoPay', 0);
      setValue('zapsRequired', 0);
      setValue('splitPayEnabled', false);
      setValue('offerZAPsToNewMembers', false);
      setValue('cryptoTypes', []);
    } else if (newModel === 'free-zaps') {
      setValue('usdCoPay', 0);
      setValue('zapsRequired', 0);
      setValue('splitPayEnabled', false);
      setValue('cryptoTypes', []);
    } else if (newModel === 'usd') {
      setValue('zapsRequired', 0);
      setValue('splitPayEnabled', false);
      setValue('cryptoTypes', []);
    } else if (newModel === 'zaps') {
      setValue('usdCoPay', 0);
      setValue('cryptoTypes', []);
    } else if (newModel === 'zaps-usd') {
      setValue('splitPayEnabled', false);
      setValue('cryptoTypes', []);
    } else if (newModel === 'crypto') {
      setValue('usdCoPay', 0);
      setValue('zapsRequired', 0);
      setValue('splitPayEnabled', false);
    }
  };

  const toggleCryptoType = (crypto: string) => {
    const current = cryptoTypes as string[];
    const updated = current.includes(crypto)
      ? current.filter(c => c !== crypto)
      : [...current, crypto];
    setValue('cryptoTypes', updated as any);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Monetization & Access</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Model Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Pricing Model</Label>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-3.5 h-3.5" />
              <span>Select one option</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pricingModels.map((model) => {
              const Icon = model.icon;
              const isSelected = pricingModel === model.id;

              return (
                <motion.div
                  key={model.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div
                    onClick={() => handlePricingModelChange(model.id)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300',
                      isSelected
                        ? `bg-gradient-to-br ${model.gradient} ${model.borderColor} shadow-md`
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'p-2 rounded-lg transition-colors',
                          isSelected ? 'bg-white/80 shadow-sm' : 'bg-gray-50'
                        )}>
                          <Icon className={cn('w-5 h-5', isSelected ? model.iconColor : 'text-gray-400')} />
                        </div>
                        <div>
                          <div className={cn(
                            'font-semibold mb-1 transition-colors',
                            isSelected ? 'text-gray-900' : 'text-gray-700'
                          )}>
                            {model.label}
                          </div>
                          <p className={cn(
                            'text-xs transition-colors',
                            isSelected ? 'text-gray-700' : 'text-gray-500'
                          )}>
                            {model.description}
                          </p>
                        </div>
                      </div>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Conditional Sub-Options */}
          <AnimatePresence mode="wait">
            {/* 1. FREE - Optional ZAPs Reward Toggle */}
            {pricingModel === 'free' && (
              <motion.div
                key="free-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <Card className="mt-4 border-emerald-200 bg-emerald-50/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-slate-900">
                          Offer Free ZAPs to new members for joining
                        </Label>
                        <p className="text-xs text-slate-600">
                          Reward new members with a welcome amount of ZAPs
                        </p>
                      </div>
                      <Controller
                        name="offerZAPsToNewMembers"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                    <AnimatePresence>
                      {offerZAPsToNewMembers && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <Label className="text-sm">ZAPs Reward Amount</Label>
                          <div className="relative">
                            <Input
                              {...register('newMemberZAPsReward', { valueAsNumber: true })}
                              type="number"
                              min="0"
                              placeholder="e.g., 50"
                              className="pl-10 bg-white"
                            />
                            <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 2. FREE ZAPS */}
            {pricingModel === 'free-zaps' && (
              <motion.div
                key="free-zaps-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card className="mt-4 border-purple-200 bg-purple-50/30">
                  <CardContent className="p-4 space-y-3">
                    <Label className="text-sm font-medium">ZAPs Reward Amount</Label>
                    <div className="relative">
                      <Input
                        {...register('newMemberZAPsReward', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        placeholder="e.g., 100"
                        className="pl-10 bg-white"
                      />
                      <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-xs text-slate-600">
                      Each new member receives this ZAPs bonus upon joining
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 3. USD PAY */}
            {pricingModel === 'usd' && (
              <motion.div
                key="usd-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card className="mt-4 border-green-200 bg-green-50/30">
                  <CardContent className="p-4 space-y-3">
                    <Label className="text-sm font-medium">USD Price</Label>
                    <div className="relative">
                      <Input
                        {...register('usdCoPay', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-10 bg-white"
                      />
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-xs text-slate-600">
                      Members pay in USD only
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 4. ZAPS PAY */}
            {pricingModel === 'zaps' && (
              <motion.div
                key="zaps-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card className="mt-4 border-violet-200 bg-violet-50/30">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">ZAPs Required</Label>
                      <div className="relative">
                        <Input
                          {...register('zapsRequired', { valueAsNumber: true })}
                          type="number"
                          min="0"
                          placeholder="0"
                          className="pl-10 bg-white"
                        />
                        <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-violet-600" />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-violet-200">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/50">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Enable Split Payment</Label>
                          <p className="text-xs text-slate-600">
                            Require both ZAPs + USD together
                          </p>
                        </div>
                        <Controller
                          name="splitPayEnabled"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>

                      <AnimatePresence>
                        {splitPayEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2"
                          >
                            <Label className="text-sm">USD Co-Pay</Label>
                            <div className="relative">
                              <Input
                                {...register('usdCoPay', { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-10 bg-white"
                              />
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 5. ZAPS + USD */}
            {pricingModel === 'zaps-usd' && (
              <motion.div
                key="zaps-usd-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card className="mt-4 border-indigo-200 bg-indigo-50/30">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">ZAPs Required</Label>
                        <div className="relative">
                          <Input
                            {...register('zapsRequired', { valueAsNumber: true })}
                            type="number"
                            min="0"
                            placeholder="0"
                            className="pl-10 bg-white"
                          />
                          <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-violet-600" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">USD Price</Label>
                        <div className="relative">
                          <Input
                            {...register('usdCoPay', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-10 bg-white"
                          />
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-3">
                      Members pay with a combination of ZAPs and USD
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 6. CRYPTO */}
            {pricingModel === 'crypto' && (
              <motion.div
                key="crypto-options"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card className="mt-4 border-orange-200 bg-orange-50/30">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Select Crypto Currency</Label>
                      <div className="flex flex-wrap gap-2">
                        {cryptoOptions.map((crypto) => (
                          <motion.button
                            key={crypto.value}
                            type="button"
                            onClick={() => toggleCryptoType(crypto.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              'px-4 py-2 rounded-lg font-medium text-sm transition-all border-2',
                              (cryptoTypes as string[]).includes(crypto.value)
                                ? `${crypto.color} border-current shadow-sm`
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            )}
                          >
                            {crypto.label}
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600">
                        Select which cryptocurrencies to accept
                      </p>
                    </div>

                    <AnimatePresence>
                      {cryptoTypes.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 pt-3 border-t border-orange-200"
                        >
                          <Label className="text-sm">Enter Amount in Selected Crypto</Label>
                          <div className="relative">
                            <Input
                              {...register('cryptoAmount')}
                              type="text"
                              placeholder="0.005 BTC or 10 USDT"
                              className="pl-10 bg-white"
                            />
                            <Bitcoin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-600" />
                          </div>
                          <p className="text-xs text-slate-600">
                            Payments processed via integrated wallet
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Join Waitlist Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={cn(
            'border-2 transition-all duration-300',
            waitlistEnabled ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200'
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Join Waitlist
                  </Label>
                  <p className="text-sm text-slate-600">
                    Enable this if your community is collecting interest via email signups instead of payments
                  </p>
                </div>
                <Controller
                  name="waitlistEnabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="border-t border-gray-200"></div>

        {/* Additional Options */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Additional Options</Label>

          {/* Member Limit */}
          <div className="space-y-2">
            <Label className="text-sm">Member List</Label>
            <Input
              {...register('slotsAvailable', {
                setValueAs: (v) => v === '' ? null : parseInt(v, 10)
              })}
              type="number"
              min="0"
              placeholder="Unlimited"
              className="bg-white"
            />
            <p className="text-xs text-gray-500">
              Leave empty for unlimited members
            </p>
          </div>

          {/* Access Duration */}
          <div className="space-y-2">
            <Label className="text-sm">Access Duration</Label>
            <Controller
              name="accessWindow"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-white">
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
              )}
            />
            <p className="text-xs text-gray-500">
              Time-based access control for members
            </p>
          </div>
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
  const { watch } = useFormContext<CreateCommunityForm>();

  const pricingModel = watch('pricingModel');
  const usdCoPay = watch('usdCoPay');
  const zapsRequired = watch('zapsRequired');
  const splitPayEnabled = watch('splitPayEnabled');
  const waitlistEnabled = watch('waitlistEnabled');
  const offerZAPsToNewMembers = watch('offerZAPsToNewMembers');
  const newMemberZAPsReward = watch('newMemberZAPsReward');

  // Determine publish destination based on requirements:
  // ZAPs Rewards Page → ZAPs Pay, Split Payment, or Reward Members
  const isZAPsRewards =
    (pricingModel === 'zaps' && !splitPayEnabled && zapsRequired > 0) || // ZAPs Pay only
    (pricingModel === 'zaps' && splitPayEnabled && zapsRequired > 0 && usdCoPay > 0) || // Split Payment
    (offerZAPsToNewMembers && newMemberZAPsReward > 0); // Reward Members

  // Community Page → Paid (USD), Free (USD=0), or Waitlist
  const isCommunityPage =
    (pricingModel === 'usd') || // Paid or Free USD
    waitlistEnabled; // Waitlist

  // Determine specific community type for display
  const communityType = (() => {
    if (waitlistEnabled) return 'Waitlist';
    if (pricingModel === 'usd' && usdCoPay === 0) return 'Free';
    if (pricingModel === 'usd' && usdCoPay > 0) return 'Paid (USD)';
    if (pricingModel === 'zaps' && splitPayEnabled) return 'Split Payment (ZAPs + USD)';
    if (pricingModel === 'zaps') return 'ZAPs Pay';
    if (offerZAPsToNewMembers) return 'Reward Members';
    return 'Unknown';
  })();

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

        {/* Publishing Destinations */}
        <div className="space-y-3">
          <Label>Publishing Destination</Label>

          {/* Community Page */}
          {isCommunityPage && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Community Page</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Type: <strong>{communityType}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {waitlistEnabled && 'Collects email addresses only (no payments)'}
                    {!waitlistEnabled && pricingModel === 'usd' && usdCoPay === 0 && 'Free community - open to everyone'}
                    {!waitlistEnabled && pricingModel === 'usd' && usdCoPay > 0 && `Entry fee: $${usdCoPay} USD`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ZAPs Rewards Page */}
          {isZAPsRewards && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900">ZAPs Rewards Page</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Type: <strong>{communityType}</strong>
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {pricingModel === 'zaps' && splitPayEnabled && `Members pay: ${zapsRequired} ZAPs + $${usdCoPay} USD`}
                    {pricingModel === 'zaps' && !splitPayEnabled && `Members pay: ${zapsRequired} ZAPs only`}
                    {offerZAPsToNewMembers && newMemberZAPsReward > 0 && `New members receive: ${newMemberZAPsReward} ZAPs`}
                  </p>
                </div>
              </div>
            </div>
          )}
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