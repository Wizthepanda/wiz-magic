import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface EditCommunityFormProps {
  communityData: {
    name: string;
    description: string;
    icon?: string;
    banner?: string;
  };
  onDataChange: (data: any) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

/**
 * EditCommunityForm Component (Phase 5)
 * - Reusable form for editing community details
 * - Name, description, icon, banner fields
 * - Image upload placeholders
 * - Save/Cancel actions
 */
export const EditCommunityForm: React.FC<EditCommunityFormProps> = ({
  communityData,
  onDataChange,
  onSave,
  onCancel,
}) => {
  const updateField = (field: string, value: any) => {
    onDataChange({
      ...communityData,
      [field]: value,
    });
  };

  const handleImageUpload = (field: 'icon' | 'banner') => {
    // Placeholder for image upload logic
    // In production, this would open a file picker and upload to storage
    console.log(`Upload ${field}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Community Name */}
      <div>
        <Label className="text-white mb-2">Community Name</Label>
        <Input
          value={communityData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter community name"
          className="bg-zinc-900 border-zinc-800 text-white rounded-xl"
        />
      </div>

      {/* Description */}
      <div>
        <Label className="text-white mb-2">Description</Label>
        <Textarea
          value={communityData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe your community..."
          className="min-h-[120px] bg-zinc-900 border-zinc-800 text-white resize-none rounded-xl"
        />
      </div>

      {/* Icon Upload */}
      <div>
        <Label className="text-white mb-2">Community Icon</Label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
            {communityData.icon ? (
              <img
                src={communityData.icon}
                alt="Community Icon"
                className="w-full h-full object-cover"
              />
            ) : (
              <Upload className="w-8 h-8 text-zinc-600" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={() => handleImageUpload('icon')}
              className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Icon
            </Button>
            {communityData.icon && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateField('icon', '')}
                className="text-red-400 hover:text-red-300 hover:bg-red-950"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Recommended: Square image, at least 200x200px
        </p>
      </div>

      {/* Banner Upload */}
      <div>
        <Label className="text-white mb-2">Banner Image</Label>
        <div className="space-y-3">
          <div className="w-full h-32 rounded-xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
            {communityData.banner ? (
              <img
                src={communityData.banner}
                alt="Community Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <Upload className="w-8 h-8 text-zinc-600" />
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleImageUpload('banner')}
              className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Banner
            </Button>
            {communityData.banner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateField('banner', '')}
                className="text-red-400 hover:text-red-300 hover:bg-red-950"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            Recommended: 1200x400px or 3:1 aspect ratio
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {(onSave || onCancel) && (
        <div className="flex gap-3 pt-4">
          {onSave && (
            <Button
              onClick={onSave}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg"
            >
              Save Changes
            </Button>
          )}
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-zinc-800 text-white hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};
