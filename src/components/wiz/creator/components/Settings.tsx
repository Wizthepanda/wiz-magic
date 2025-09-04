import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCreatorProfile } from '../hooks/useCreatorProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  User,
  Globe,
  Bell,
  DollarSign,
  Shield,
  Youtube,
  Settings as SettingsIcon,
  Save,
  ExternalLink
} from 'lucide-react';

interface SettingsProps {
  userId: string;
}

export const CreatorSettings: React.FC<SettingsProps> = ({ userId }) => {
  const { data: profile, updateProfile, isLoading } = useCreatorProfile(userId);
  const isMobile = useIsMobile();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    wizName: profile?.wizName || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    socialLinks: {
      twitter: profile?.socialLinks?.twitter || '',
      instagram: profile?.socialLinks?.instagram || '',
      tiktok: profile?.socialLinks?.tiktok || '',
      discord: profile?.socialLinks?.discord || ''
    },
    profileVisibility: profile?.profileVisibility || 'public',
    allowMessages: profile?.allowMessages ?? true,
    showEarnings: profile?.showEarnings ?? false,
    categories: profile?.categories || [],
    targetAudience: profile?.targetAudience || []
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Settings save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Creator Settings</h2>
          <p className="text-slate-600">Manage your profile and account preferences</p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-purple-600 to-pink-600">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Profile Information */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
            <div>
              <Label htmlFor="wizName" className="text-slate-900">Display Name</Label>
              <Input
                id="wizName"
                value={formData.wizName}
                onChange={(e) => handleInputChange('wizName', e.target.value)}
                placeholder="Your wizard name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="location" className="text-slate-900">Location</Label>
              <Input
                id="location"
                value={formData.location}
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
              value={formData.bio}
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
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://your-website.com"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Globe className="w-5 h-5" />
            Social Media Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
            <div>
              <Label htmlFor="twitter" className="text-slate-900">Twitter</Label>
              <Input
                id="twitter"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="@username"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="instagram" className="text-slate-900">Instagram</Label>
              <Input
                id="instagram"
                value={formData.socialLinks.instagram}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                placeholder="@username"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="tiktok" className="text-slate-900">TikTok</Label>
              <Input
                id="tiktok"
                value={formData.socialLinks.tiktok}
                onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                placeholder="@username"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="discord" className="text-slate-900">Discord</Label>
              <Input
                id="discord"
                value={formData.socialLinks.discord}
                onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
                placeholder="Username#1234"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Visibility */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Shield className="w-5 h-5" />
            Privacy & Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-900">Profile Visibility</Label>
              <p className="text-sm text-slate-600">Control who can see your profile</p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="public" className="text-sm text-slate-900">Private</Label>
              <Switch
                id="profileVisibility"
                checked={formData.profileVisibility === 'public'}
                onCheckedChange={(checked) => 
                  handleInputChange('profileVisibility', checked ? 'public' : 'private')
                }
              />
              <Label htmlFor="public" className="text-sm text-slate-900">Public</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-900">Allow Direct Messages</Label>
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
              <p className="text-sm text-slate-600">Display earnings information on your profile</p>
            </div>
            <Switch
              checked={formData.showEarnings}
              onCheckedChange={(checked) => handleInputChange('showEarnings', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* YouTube Integration */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Youtube className="w-5 h-5" />
            YouTube Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200/50">
            <div>
              <div className="font-medium text-slate-900">YouTube Channel</div>
              <div className="text-sm text-slate-600">
                {profile?.youtubeData?.isConnected 
                  ? `Connected to @${profile.youtubeData.handle}`
                  : 'Not connected'
                }
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {profile?.youtubeData?.isConnected && (
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Channel
                </Button>
              )}
              <Button variant="outline" size="sm">
                {profile?.youtubeData?.isConnected ? 'Reconnect' : 'Connect'}
              </Button>
            </div>
          </div>

          <div className="text-sm text-slate-600">
            <p>YouTube integration allows you to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Sync channel data and statistics</li>
              <li>Import video thumbnails and metadata</li>
              <li>Display subscriber count on your profile</li>
              <li>Auto-update content from your channel</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              title: 'New Comments',
              description: 'Get notified when someone comments on your content',
              key: 'newComments'
            },
            {
              title: 'New Followers',
              description: 'Get notified when someone follows you',
              key: 'newFollowers'
            },
            {
              title: 'Course Enrollments',
              description: 'Get notified when someone enrolls in your courses',
              key: 'courseEnrollments'
            },
            {
              title: 'Tips Received',
              description: 'Get notified when you receive tips',
              key: 'tipsReceived'
            },
            {
              title: 'Weekly Analytics',
              description: 'Receive weekly performance summaries',
              key: 'weeklyAnalytics'
            }
          ].map((notification, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <Label className="text-slate-900">{notification.title}</Label>
                <p className="text-sm text-slate-600">{notification.description}</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Monetization */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <DollarSign className="w-5 h-5" />
            Monetization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border border-slate-200/50 bg-slate-50/50">
            <div className="font-medium text-slate-900 mb-2">Payment Information</div>
            <div className="text-sm text-slate-600 mb-3">
              Set up your payment method to receive earnings from tips, courses, and sponsorships.
            </div>
            <Button variant="outline" size="sm">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Manage Payment Methods
            </Button>
          </div>

          <div className="p-4 rounded-lg border border-slate-200/50 bg-slate-50/50">
            <div className="font-medium text-slate-900 mb-2">Tax Information</div>
            <div className="text-sm text-slate-600 mb-3">
              Provide tax information for earnings reporting and compliance.
            </div>
            <Button variant="outline" size="sm">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Update Tax Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};