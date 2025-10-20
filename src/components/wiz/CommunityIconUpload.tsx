import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CommunityService } from '@/lib/community-service';

interface CommunityIconUploadProps {
  value?: string;
  onChange: (url: string) => void;
  communityId?: string;
  className?: string;
}

export const CommunityIconUpload: React.FC<CommunityIconUploadProps> = ({
  value,
  onChange,
  communityId,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setUploadSuccess(false);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, SVG, or WEBP image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Validate dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      // Check minimum dimensions
      if (img.width < 200 || img.height < 200) {
        URL.revokeObjectURL(objectUrl);
        setError('Image must be at least 200×200px');
        return;
      }

      // Recommend square ratio
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 0.8 || aspectRatio > 1.2) {
        console.warn('⚠️ Image is not square (recommended 1:1 aspect ratio)');
      }

      // Show preview immediately with blob URL
      setPreviewUrl(objectUrl);

      // Upload to server
      setIsUploading(true);
      try {
        const uploadedUrl = await uploadProfileIcon(file);

        // Update preview to use Firebase URL instead of blob URL
        setPreviewUrl(uploadedUrl);

        // Update form state
        onChange(uploadedUrl);
        setUploadSuccess(true);

        // Clean up blob URL after we have the Firebase URL
        URL.revokeObjectURL(objectUrl);

        // Show success checkmark for 2 seconds
        setTimeout(() => setUploadSuccess(false), 2000);
      } catch (error) {
        console.error('❌ Upload error:', error);
        setError('Upload failed. Please try again.');
        setPreviewUrl(null);
        URL.revokeObjectURL(objectUrl);
      } finally {
        setIsUploading(false);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError('Invalid image file');
    };

    img.src = objectUrl;
  };

  const uploadProfileIcon = async (file: File): Promise<string> => {
    try {
      // Import Firebase Storage dynamically
      const { storage } = await import('@/lib/firebase');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

      // Create a temporary community ID if one doesn't exist
      const tempId = communityId || `temp_${Date.now()}`;

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filename = `${timestamp}_${sanitizedName}`;

      // Create storage reference
      const storageRef = ref(storage, `communities/${tempId}/icon/${filename}`);

      console.log('📤 Uploading community icon:', filename);

      // Upload file to Firebase Storage
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      console.log('✅ Community icon uploaded successfully:', downloadUrl);

      return downloadUrl;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw new Error('Failed to upload icon');
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange('');
    setError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label className="text-base font-semibold">Community Profile Icon</Label>
        <p className="text-sm text-gray-500">
          Upload your community's profile picture or logo. This icon will appear in your Communities list and side panel.
        </p>
      </div>

      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <motion.div
          whileHover={{ scale: previewUrl ? 1 : 1.03 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(
            'relative aspect-square w-full max-w-[280px] rounded-xl border-2 overflow-hidden',
            'transition-all duration-200',
            previewUrl
              ? 'border-violet-400 bg-white'
              : 'border-dashed border-gray-300 bg-gray-50 hover:border-violet-400 hover:bg-violet-50/30 cursor-pointer'
          )}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
        >
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
              >
                <Loader className="w-10 h-10 text-violet-600 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-700">Uploading...</p>
              </motion.div>
            ) : previewUrl ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full h-full group"
              >
                <img
                  src={previewUrl}
                  alt="Community icon preview"
                  className="w-full h-full object-cover"
                />

                {/* Success Checkmark Overlay */}
                <AnimatePresence>
                  {uploadSuccess && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="absolute inset-0 flex items-center justify-center bg-green-500/90 backdrop-blur-sm"
                    >
                      <Check className="w-16 h-16 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="transform"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
              >
                <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-violet-600" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">Upload Icon</p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, SVG, or WEBP
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Min 200×200px, Recommended 400×400px
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Change Icon Button */}
        {previewUrl && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-[280px]"
            >
              <Upload className="w-4 h-4 mr-2" />
              Change Icon
            </Button>
          </motion.div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-500 mt-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Tooltip/Help Text */}
        {!error && !previewUrl && (
          <p className="text-xs text-gray-400 mt-2 max-w-[280px]">
            This will appear as your community profile icon across WIZUP
          </p>
        )}
      </div>
    </div>
  );
};
