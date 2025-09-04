import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CreatorProfile, UpdateCreatorProfileData } from '../hooks/useCreatorProfile';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentProfile?: CreatorProfile | null;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onOpenChange,
  userId,
  currentProfile
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateCreatorProfileData>({
    wizName: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      tiktok: '',
      discord: ''
    },
    profileVisibility: 'public',
    allowMessages: true,
    showEarnings: false
  });

  // Initialize form data when dialog opens or profile changes
  useEffect(() => {
    if (currentProfile) {
      setFormData({
        wizName: currentProfile.wizName || '',
        bio: currentProfile.bio || '',
        location: currentProfile.location || '',
        website: currentProfile.website || '',
        socialLinks: {
          twitter: currentProfile.socialLinks?.twitter || '',
          instagram: currentProfile.socialLinks?.instagram || '',
          tiktok: currentProfile.socialLinks?.tiktok || '',
          discord: currentProfile.socialLinks?.discord || ''
        },
        profileVisibility: currentProfile.profileVisibility || 'public',
        allowMessages: currentProfile.allowMessages ?? true,
        showEarnings: currentProfile.showEarnings ?? false
      });
    }
  }, [currentProfile, open]);

  const handleInputChange = (field: keyof UpdateCreatorProfileData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Here you would typically call the updateProfile function
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving profile data:', formData);
      
      toast.success('Profile updated successfully!');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form data to current profile when closing
    if (currentProfile) {
      setFormData({
        wizName: currentProfile.wizName || '',
        bio: currentProfile.bio || '',
        location: currentProfile.location || '',
        website: currentProfile.website || '',
        socialLinks: {
          twitter: currentProfile.socialLinks?.twitter || '',
          instagram: currentProfile.socialLinks?.instagram || '',
          tiktok: currentProfile.socialLinks?.tiktok || '',
          discord: currentProfile.socialLinks?.discord || ''
        },
        profileVisibility: currentProfile.profileVisibility || 'public',
        allowMessages: currentProfile.allowMessages ?? true,
        showEarnings: currentProfile.showEarnings ?? false
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Edit Profile</DialogTitle>
          <DialogDescription className="text-slate-600">
            Update your creator profile information and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wizName" className="text-slate-900">Display Name</Label>
                <Input
                  id="wizName"
                  value={formData.wizName || ''}
                  onChange={(e) => handleInputChange('wizName', e.target.value)}
                  placeholder="Your wizard name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="location" className="text-slate-900">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio" className="text-slate-900">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell your audience about yourself..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="website" className="text-slate-900">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://your-website.com"
                className="mt-1"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Social Media</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="twitter" className="text-slate-900">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.socialLinks?.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="@username"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="instagram" className="text-slate-900">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.socialLinks?.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="@username"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tiktok" className="text-slate-900">TikTok</Label>
                <Input
                  id="tiktok"
                  value={formData.socialLinks?.tiktok || ''}
                  onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                  placeholder="@username"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="discord" className="text-slate-900">Discord</Label>
                <Input
                  id="discord"
                  value={formData.socialLinks?.discord || ''}
                  onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
                  placeholder="Username#1234"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Privacy Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-900">Profile Visibility</Label>
                  <p className="text-sm text-slate-600">Make your profile visible to everyone</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="visibility" className="text-sm text-slate-900">Private</Label>
                  <Switch
                    id="visibility"
                    checked={formData.profileVisibility === 'public'}
                    onCheckedChange={(checked) => 
                      handleInputChange('profileVisibility', checked ? 'public' : 'private')
                    }
                  />
                  <Label htmlFor="visibility" className="text-sm text-slate-900">Public</Label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-900">Allow Messages</Label>
                  <p className="text-sm text-slate-600">Let viewers send you direct messages</p>
                </div>
                <Switch
                  checked={formData.allowMessages}
                  onCheckedChange={(checked) => handleInputChange('allowMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-900">Show Earnings</Label>
                  <p className="text-sm text-slate-600">Display earnings on your profile</p>
                </div>
                <Switch
                  checked={formData.showEarnings}
                  onCheckedChange={(checked) => handleInputChange('showEarnings', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};