import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Globe,
  Lock,
  Eye,
  Plus,
  X,
  Youtube,
  Link as LinkIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCommunityCreateStore } from '@/store/communityCreateStore';
import { communityCategories } from '@/lib/schemas/community';
import { toast } from 'sonner';
import { uploadImage, generateUniqueFilename } from '@/lib/storage-utils';
import { useAuth } from '@/hooks/useAuth';
import { categoryOptions, getMainCategories, getSubCategories, type MainCategory } from '@/data/categories';

const visibilityOptions = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can find and join',
    icon: Globe,
    enabled: true
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Invite-only, hidden from search',
    icon: Lock,
    enabled: true
  },
  // Token Gated temporarily disabled
  // {
  //   value: 'token-gated',
  //   label: 'Token Gated',
  //   description: 'Requires wallet verification',
  //   icon: Eye,
  //   enabled: false
  // }
] as const;

export const StepDetails: React.FC = () => {
  const store = useCommunityCreateStore();
  const { user } = useAuth();
  const [tagInput, setTagInput] = useState('');
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'youtube' | 'upload'>('upload');
  const [mediaUrl, setMediaUrl] = useState('');
  const [zapPulse, setZapPulse] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  // Character limits
  const TITLE_MAX = 120;
  const TAGLINE_MAX = 140;
  const DESCRIPTION_MAX = 500;

  // Trigger ZAP pulse when title or tagline changes
  useEffect(() => {
    if (store.title || store.tagline) {
      setZapPulse(true);
      const timeout = setTimeout(() => setZapPulse(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [store.title, store.tagline]);

  const handleAddTag = () => {
    if (tagInput.trim() && store.tags.length < 10) {
      if (!store.tags.includes(tagInput.trim())) {
        store.setTags([...store.tags, tagInput.trim()]);
        setTagInput('');
      } else {
        toast.error('Tag already exists');
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    store.setTags(store.tags.filter(t => t !== tag));
  };

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setUploadError('');

    // Validate file type - accept all common image formats
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/svg+xml',
      'image/tiff',
      'image/x-icon',
      'image/heic',
      'image/heif'
    ];
    
    // Also check by file extension as fallback (some browsers may not set MIME type correctly)
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'tiff', 'tif', 'ico', 'heic', 'heif'];
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
      setUploadError('Please upload a valid image file (JPG, PNG, WEBP, GIF, BMP, SVG, TIFF, ICO, HEIC, or HEIF)');
      // Reset input
      event.target.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      // Reset input
      event.target.value = '';
      return;
    }

    setIsUploadingCover(true);
    try {
      // Generate unique filename
      const filename = generateUniqueFilename(file.name);
      const storagePath = `communities/covers/${user?.uid || 'anonymous'}/${filename}`;

      console.log('Uploading image:', { filename, storagePath, size: file.size, type: file.type });

      // Upload to Firebase Storage
      const downloadURL = await uploadImage(file, storagePath);

      // Set preview
      setUploadedImagePreview(downloadURL);
      setUploadError(''); // Clear any previous errors
      toast.success('Image uploaded successfully');
      
      // Reset input to allow uploading the same file again if needed
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading cover image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
      setUploadError(errorMessage);
      toast.error(errorMessage);
      // Reset input on error
      event.target.value = '';
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAddMedia = () => {
    if (store.coverMedia.length >= 5) {
      toast.error('Maximum 5 media items allowed');
      return;
    }

    // Handle upload type
    if (mediaType === 'upload') {
      if (!uploadedImagePreview) {
        toast.error('Please upload an image first');
        return;
      }

      const newMedia = {
        type: 'image',
        url: uploadedImagePreview,
        thumbnail: uploadedImagePreview
      };

      store.setCoverMedia([...store.coverMedia, newMedia]);
      setUploadedImagePreview('');
      setShowMediaDialog(false);
      toast.success('Cover image added successfully');
      return;
    }

    // Handle URL types (image/youtube)
    if (!mediaUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    const newMedia = {
      type: mediaType,
      url: mediaUrl,
      thumbnail: mediaType === 'youtube' ? extractYouTubeThumbnail(mediaUrl) : mediaUrl
    };

    store.setCoverMedia([...store.coverMedia, newMedia]);
    setMediaUrl('');
    setShowMediaDialog(false);
    toast.success('Media added successfully');
  };

  const handleRemoveMedia = (index: number) => {
    store.setCoverMedia(store.coverMedia.filter((_, i) => i !== index));
  };

  const extractYouTubeThumbnail = (url: string): string => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : url;
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleProfileIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploadingIcon(true);
    try {
      // Generate unique filename
      const filename = generateUniqueFilename(file.name);
      const storagePath = `communities/icons/${user?.uid || 'anonymous'}/${filename}`;

      // Upload to Firebase Storage
      const downloadURL = await uploadImage(file, storagePath);

      // Store only the URL in the store
      store.setProfileIcon(downloadURL);
      toast.success('Profile icon uploaded');
    } catch (error) {
      console.error('Error uploading profile icon:', error);
      toast.error('Failed to upload icon. Please try again.');
    } finally {
      setIsUploadingIcon(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* ZAP Pulse Animation Overlay */}
      <AnimatePresence>
        {zapPulse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <Sparkles className="w-32 h-32 text-purple-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Community Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-semibold flex items-center space-x-2">
          <span>Community Title</span>
          <Badge variant="secondary" className="text-xs">Required</Badge>
        </Label>
        <Input
          id="title"
          placeholder="Enter your community name..."
          value={store.title}
          onChange={(e) => store.setTitle(e.target.value.slice(0, TITLE_MAX))}
          className="text-lg font-medium"
        />
        <div className="flex items-center justify-between text-xs">
          <p className="text-gray-500">Make it clear and memorable</p>
          <span className={cn(
            "font-medium",
            store.title.length > TITLE_MAX - 20 ? "text-orange-500" : "text-gray-400"
          )}>
            {store.title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <Label htmlFor="tagline" className="text-base font-semibold flex items-center space-x-2">
          <span>Tagline</span>
          <Badge variant="outline" className="text-xs">Optional</Badge>
        </Label>
        <Input
          id="tagline"
          placeholder="One-line summary of your community..."
          value={store.tagline}
          onChange={(e) => store.setTagline(e.target.value.slice(0, TAGLINE_MAX))}
          className="text-sm"
        />
        <div className="flex items-center justify-between text-xs">
          <p className="text-gray-500">A catchy one-liner</p>
          <span className={cn(
            "font-medium",
            store.tagline.length > TAGLINE_MAX - 20 ? "text-orange-500" : "text-gray-400"
          )}>
            {store.tagline.length}/{TAGLINE_MAX}
          </span>
        </div>
      </div>

      {/* Category & Visibility Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Category & Sub Category */}
        <div className="space-y-4">
          {/* Main Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-semibold flex items-center space-x-2">
              <span>Category</span>
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </Label>
            <Select
              value={store.category}
              onValueChange={(value) => {
                store.setCategory(value);
                // Reset sub category when main category changes
                store.setSubCategory('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {getMainCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub Category - Only show when main category is selected */}
          <AnimatePresence>
            {store.category && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="subCategory" className="text-base font-semibold">
                  Sub Category
                </Label>
                <Select value={store.subCategory || ''} onValueChange={store.setSubCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubCategories(store.category as MainCategory).map((subCat) => (
                      <SelectItem key={subCat} value={subCat}>
                        {subCat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Visibility */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Visibility</Label>
          <RadioGroup
            value={store.visibility}
            onValueChange={(value) => store.setVisibility(value as any)}
            className="grid grid-cols-2 gap-3"
          >
            {visibilityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <motion.label
                  key={option.value}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    store.visibility === option.value
                      ? "border-purple-500 bg-purple-50 shadow-lg shadow-purple-500/20"
                      : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RadioGroupItem value={option.value} className="sr-only" />
                  <Icon className={cn(
                    "w-6 h-6 mb-2",
                    store.visibility === option.value ? "text-purple-600" : "text-gray-500"
                  )} />
                  <span className={cn(
                    "text-sm font-semibold mb-1",
                    store.visibility === option.value ? "text-purple-700" : "text-gray-700"
                  )}>
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500 text-center">
                    {option.description}
                  </span>
                </motion.label>
              );
            })}
          </RadioGroup>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-semibold flex items-center space-x-2">
          <span>Description</span>
          <Badge variant="secondary" className="text-xs">Required</Badge>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what your community is about, what value it provides, and who should join..."
          value={store.description}
          onChange={(e) => store.setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
          rows={5}
          className="resize-none"
        />
        <div className="flex items-center justify-between text-xs">
          <p className="text-gray-500">Be clear and compelling</p>
          <span className={cn(
            "font-medium",
            store.description.length > DESCRIPTION_MAX - 50 ? "text-orange-500" : "text-gray-400"
          )}>
            {store.description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
      </div>

      {/* Profile Icon & Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Icon Upload */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Profile Icon</Label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {store.profileIcon ? (
                  <img src={store.profileIcon} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              {store.profileIcon && (
                <button
                  onClick={() => store.setProfileIcon('')}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="profileIcon" className={cn("cursor-pointer", isUploadingIcon && "opacity-50 pointer-events-none")}>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {isUploadingIcon ? 'Uploading...' : 'Upload Icon'}
                  </span>
                </div>
                <input
                  id="profileIcon"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileIconUpload}
                  className="hidden"
                  disabled={isUploadingIcon}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Recommended: 256x256px, max 5MB</p>
            </div>
          </div>
        </div>

        {/* Cover Media */}
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center justify-between">
            <span>Cover Media</span>
            <Badge variant="outline" className="text-xs">
              {store.coverMedia.length}/5
            </Badge>
          </Label>
          <Button
            onClick={() => setShowMediaDialog(true)}
            variant="outline"
            className="w-full"
            disabled={store.coverMedia.length >= 5}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Image or Video
          </Button>

          {/* Media Preview */}
          {store.coverMedia.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {store.coverMedia.map((media, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={media.thumbnail || media.url}
                      alt={`Cover ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {media.type === 'youtube' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Youtube className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-base font-semibold flex items-center justify-between">
          <span>Tags</span>
          <Badge variant="outline" className="text-xs">
            {store.tags.length}/10
          </Badge>
        </Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            disabled={store.tags.length >= 10}
          />
          <Button
            onClick={handleAddTag}
            disabled={!tagInput.trim() || store.tags.length >= 10}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {store.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {store.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="pl-3 pr-1 py-1 flex items-center space-x-2"
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Add Media Dialog */}
      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Cover Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={mediaType} onValueChange={(val) => setMediaType(val as any)}>
              <div className="grid grid-cols-3 gap-3">
                <label className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                  mediaType === 'upload' ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                )}>
                  <RadioGroupItem value="upload" className="mb-2" />
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="font-medium text-sm text-center">Upload Image</span>
                </label>
                <label className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                  mediaType === 'image' ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                )}>
                  <RadioGroupItem value="image" className="mb-2" />
                  <ImageIcon className="w-5 h-5 mb-1" />
                  <span className="font-medium text-sm text-center">Image URL</span>
                </label>
                <label className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                  mediaType === 'youtube' ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                )}>
                  <RadioGroupItem value="youtube" className="mb-2" />
                  <Youtube className="w-5 h-5 mb-1" />
                  <span className="font-medium text-sm text-center">YouTube</span>
                </label>
              </div>
            </RadioGroup>

            {/* Upload Image Section */}
            {mediaType === 'upload' && (
              <div className="space-y-2">
                <Label>Upload Cover Image</Label>
                <div className={cn(
                  "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-all cursor-pointer",
                  uploadedImagePreview
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-purple-400 bg-white/50",
                  isUploadingCover && "opacity-50 pointer-events-none"
                )}>
                  {uploadedImagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={uploadedImagePreview}
                        alt="Cover Preview"
                        className="rounded-xl w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium">Click to change image</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isUploadingCover}
                      />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        {isUploadingCover ? 'Uploading...' : 'Click or drag image to upload'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">All image formats • Max 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isUploadingCover}
                      />
                    </>
                  )}
                </div>
                {uploadError && (
                  <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                )}
              </div>
            )}

            {/* URL Input Section */}
            {(mediaType === 'image' || mediaType === 'youtube') && (
              <div className="space-y-2">
                <Label>
                  {mediaType === 'image' ? 'Image URL' : 'YouTube URL'}
                </Label>
                <Input
                  placeholder={mediaType === 'image' ? 'https://...' : 'https://youtube.com/watch?v=...'}
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMediaDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMedia}
              disabled={isUploadingCover || (mediaType === 'upload' && !uploadedImagePreview)}
            >
              Add Media
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
