import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Palette, X } from 'lucide-react';
import { useCourseCreateStore } from '@/store/courseCreateStore';
import { uploadImage } from '@/lib/storage-utils';
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
];

export const StepCourseBranding: React.FC = () => {
  const { user } = useAuth();
  const store = useCourseCreateStore();
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  
  const handleCoverUpload = async (file: File) => {
    if (!user?.uid) {
      toast.error('Please sign in to upload');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setIsUploadingCover(true);
    try {
      const url = await uploadImage(
        file,
        `courses/${user.uid}/covers/${Date.now()}_${file.name}`
      );
      store.setCoverURL(url);
      toast.success('Cover image uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload cover');
    } finally {
      setIsUploadingCover(false);
    }
  };
  
  const handleBannerUpload = async (file: File) => {
    if (!user?.uid) {
      toast.error('Please sign in to upload');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setIsUploadingBanner(true);
    try {
      const url = await uploadImage(
        file,
        `courses/${user.uid}/banners/${Date.now()}_${file.name}`
      );
      store.setBannerURL(url);
      toast.success('Banner image uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload banner');
    } finally {
      setIsUploadingBanner(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Cover Image Upload */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Course Cover Image</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Recommended: 16:9 aspect ratio (1280x720px or larger). Max 5MB.
        </p>
        
        {store.coverURL ? (
          <div className="relative aspect-video rounded-xl overflow-hidden group">
            <img
              src={store.coverURL}
              alt="Course cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => store.setCoverURL('')}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <label className={cn(
            "block aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer",
            isUploadingCover
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-gray-300 hover:border-indigo-500 hover:bg-gray-50"
          )}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
              }}
              className="hidden"
              disabled={isUploadingCover}
            />
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              {isUploadingCover ? (
                <>
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 mb-3" />
                  <p className="font-medium text-lg">Click to upload cover image</p>
                  <p className="text-sm mt-1">PNG, JPG, or WebP (max 5MB)</p>
                </>
              )}
            </div>
          </label>
        )}
      </div>
      
      {/* Optional Banner */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Course Preview Banner (Optional)</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Add an additional wide banner for course preview pages
        </p>
        
        {store.bannerURL ? (
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden group">
            <img
              src={store.bannerURL}
              alt="Course banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => store.setBannerURL('')}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <label className={cn(
            "block aspect-[21/9] rounded-xl border-2 border-dashed transition-all cursor-pointer",
            isUploadingBanner
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-gray-300 hover:border-indigo-500 hover:bg-gray-50"
          )}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBannerUpload(file);
              }}
              className="hidden"
              disabled={isUploadingBanner}
            />
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              {isUploadingBanner ? (
                <>
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 mb-2" />
                  <p className="font-medium">Click to upload banner (optional)</p>
                  <p className="text-sm mt-1">PNG, JPG, or WebP (max 5MB)</p>
                </>
              )}
            </div>
          </label>
        )}
      </div>
      
      {/* Theme Color Picker */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Theme Color</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Choose a primary color for your course branding
        </p>
        
        {/* Preset Colors */}
        <div className="grid grid-cols-9 gap-3 mb-4">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => store.setThemeColor(color.value)}
              className={cn(
                "w-full aspect-square rounded-lg transition-all hover:scale-110",
                store.themeColor === color.value && "ring-4 ring-offset-2 ring-indigo-500"
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
        
        {/* Custom Color Picker */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="color"
              value={store.themeColor}
              onChange={(e) => store.setThemeColor(e.target.value)}
              className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-200"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Custom Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={store.themeColor}
                onChange={(e) => store.setThemeColor(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="#000000"
              />
              <div
                className="w-10 h-10 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: store.themeColor }}
              />
            </div>
          </div>
        </div>
        
        {/* Color Preview */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${store.themeColor}20` }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full"
              style={{ backgroundColor: store.themeColor }}
            />
            <div>
              <p className="font-medium" style={{ color: store.themeColor }}>
                {store.title || 'Your Course Title'}
              </p>
              <p className="text-sm text-gray-600">This is how your theme color will look</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

