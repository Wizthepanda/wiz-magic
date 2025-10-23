import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Info,
  Trophy,
  Users,
  Palette,
  Settings,
  Upload,
  Trash2,
  Plus,
  GripVertical,
  Search,
  Crown,
  Shield,
  UserMinus,
  Eye,
  EyeOff,
  MessageCircle,
  Pin,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CommunitySettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  communityName: string;
  onSave?: (data: any) => void;
}

type TabType = 'about' | 'rewards' | 'members' | 'branding' | 'settings';

/**
 * CommunitySettingsDrawer Component (Phase 5)
 * - Sliding drawer from right for community management
 * - 5 tabs: About, Rewards, Members, Branding, Settings
 * - Real-time editing with Save Changes button
 * - Smooth animations with Framer Motion
 */
export const CommunitySettingsDrawer: React.FC<CommunitySettingsDrawerProps> = ({
  isOpen,
  onClose,
  communityId,
  communityName,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [hasChanges, setHasChanges] = useState(false);

  // About Tab State
  const [aboutDescription, setAboutDescription] = useState('');
  const [creatorBio, setCreatorBio] = useState('');
  const [milestones, setMilestones] = useState([
    { id: '1', title: '', description: '', date: '', icon: '🚀' },
  ]);

  // Rewards Tab State
  const [rewardTiers, setRewardTiers] = useState([
    { id: '1', name: 'Bronze', xpThreshold: 1000, rewards: [''] },
  ]);

  // Members Tab State
  const [members, setMembers] = useState([
    { id: '1', name: 'John Doe', role: 'Member', avatar: '' },
  ]);
  const [memberSearch, setMemberSearch] = useState('');

  // Branding Tab State
  const [profileIcon, setProfileIcon] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [colorTheme, setColorTheme] = useState('purple-sky');

  // Settings Tab State
  const [isPublic, setIsPublic] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [pinnedPostsEnabled, setPinnedPostsEnabled] = useState(true);
  const [autoApprovemembers, setAutoApproveMembers] = useState(false);

  const handleSave = () => {
    const data = {
      about: { description: aboutDescription, bio: creatorBio, milestones },
      rewards: { tiers: rewardTiers },
      members,
      branding: { profileIcon, bannerImage, colorTheme },
      settings: { isPublic, commentsEnabled, pinnedPostsEnabled, autoApprovemembers },
    };
    onSave?.(data);
    setHasChanges(false);
  };

  const tabs = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'rewards', label: 'Rewards', icon: Trophy },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const colorThemes = [
    { id: 'purple-sky', name: 'Purple → Sky', gradient: 'from-purple-600 to-sky-500' },
    { id: 'fuchsia-sky', name: 'Fuchsia → Sky', gradient: 'from-fuchsia-600 to-sky-500' },
    { id: 'amber-indigo', name: 'Amber → Indigo', gradient: 'from-amber-500 to-indigo-600' },
    { id: 'rose-orange', name: 'Rose → Orange', gradient: 'from-rose-500 to-orange-500' },
    { id: 'emerald-cyan', name: 'Emerald → Cyan', gradient: 'from-emerald-500 to-cyan-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{communityName}</h2>
                  <p className="text-sm text-zinc-400 mt-1">Community Settings</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-10 w-10 p-0 hover:bg-zinc-800 rounded-full"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </Button>
              </div>

              {/* Save Button */}
              <motion.div
                animate={hasChanges ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={cn(
                    'w-full rounded-xl font-semibold shadow-lg transition-all duration-300',
                    hasChanges
                      ? 'bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white shadow-purple-500/50'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  )}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {hasChanges ? 'Save Changes' : 'No Changes'}
                </Button>
              </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-zinc-800 overflow-x-auto">
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={cn(
                      'rounded-xl transition-all duration-300',
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    )}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'about' && (
                  <AboutTabContent
                    description={aboutDescription}
                    onDescriptionChange={(val) => {
                      setAboutDescription(val);
                      setHasChanges(true);
                    }}
                    bio={creatorBio}
                    onBioChange={(val) => {
                      setCreatorBio(val);
                      setHasChanges(true);
                    }}
                    milestones={milestones}
                    onMilestonesChange={(val) => {
                      setMilestones(val);
                      setHasChanges(true);
                    }}
                  />
                )}

                {activeTab === 'rewards' && (
                  <RewardsTabContent
                    tiers={rewardTiers}
                    onTiersChange={(val) => {
                      setRewardTiers(val);
                      setHasChanges(true);
                    }}
                  />
                )}

                {activeTab === 'members' && (
                  <MembersTabContent
                    members={members}
                    searchQuery={memberSearch}
                    onSearchChange={setMemberSearch}
                    onMembersChange={(val) => {
                      setMembers(val);
                      setHasChanges(true);
                    }}
                  />
                )}

                {activeTab === 'branding' && (
                  <BrandingTabContent
                    profileIcon={profileIcon}
                    onProfileIconChange={(val) => {
                      setProfileIcon(val);
                      setHasChanges(true);
                    }}
                    bannerImage={bannerImage}
                    onBannerImageChange={(val) => {
                      setBannerImage(val);
                      setHasChanges(true);
                    }}
                    colorTheme={colorTheme}
                    onColorThemeChange={(val) => {
                      setColorTheme(val);
                      setHasChanges(true);
                    }}
                    colorThemes={colorThemes}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsTabContent
                    isPublic={isPublic}
                    onIsPublicChange={(val) => {
                      setIsPublic(val);
                      setHasChanges(true);
                    }}
                    commentsEnabled={commentsEnabled}
                    onCommentsEnabledChange={(val) => {
                      setCommentsEnabled(val);
                      setHasChanges(true);
                    }}
                    pinnedPostsEnabled={pinnedPostsEnabled}
                    onPinnedPostsEnabledChange={(val) => {
                      setPinnedPostsEnabled(val);
                      setHasChanges(true);
                    }}
                    autoApproveMembers={autoApprovemembers}
                    onAutoApproveMembersChange={(val) => {
                      setAutoApproveMembers(val);
                      setHasChanges(true);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// About Tab Content Component
const AboutTabContent: React.FC<{
  description: string;
  onDescriptionChange: (val: string) => void;
  bio: string;
  onBioChange: (val: string) => void;
  milestones: any[];
  onMilestonesChange: (val: any[]) => void;
}> = ({ description, onDescriptionChange, bio, onBioChange, milestones, onMilestonesChange }) => {
  const addMilestone = () => {
    onMilestonesChange([
      ...milestones,
      { id: Date.now().toString(), title: '', description: '', date: '', icon: '🚀' },
    ]);
  };

  const removeMilestone = (id: string) => {
    onMilestonesChange(milestones.filter((m) => m.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <Label className="text-white mb-2">Community Description</Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Tell members what this community is about..."
          className="min-h-[120px] bg-zinc-900 border-zinc-800 text-white resize-none rounded-xl"
        />
      </div>

      <Separator className="bg-zinc-800" />

      <div>
        <Label className="text-white mb-2">Creator Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Share your story and expertise..."
          className="min-h-[100px] bg-zinc-900 border-zinc-800 text-white resize-none rounded-xl"
        />
      </div>

      <Separator className="bg-zinc-800" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-white">Milestones</Label>
          <Button
            onClick={addMilestone}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{milestone.icon}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(milestone.id)}
                  className="h-8 w-8 p-0 hover:bg-red-950 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Input
                value={milestone.title}
                onChange={(e) => {
                  const updated = [...milestones];
                  updated[index].title = e.target.value;
                  onMilestonesChange(updated);
                }}
                placeholder="Milestone title"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Input
                value={milestone.description}
                onChange={(e) => {
                  const updated = [...milestones];
                  updated[index].description = e.target.value;
                  onMilestonesChange(updated);
                }}
                placeholder="Description"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Input
                value={milestone.date}
                onChange={(e) => {
                  const updated = [...milestones];
                  updated[index].date = e.target.value;
                  onMilestonesChange(updated);
                }}
                placeholder="Date (e.g., Jan 2024)"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Rewards Tab Content Component
const RewardsTabContent: React.FC<{
  tiers: any[];
  onTiersChange: (val: any[]) => void;
}> = ({ tiers, onTiersChange }) => {
  const addTier = () => {
    onTiersChange([
      ...tiers,
      { id: Date.now().toString(), name: '', xpThreshold: 0, rewards: [''] },
    ]);
  };

  const removeTier = (id: string) => {
    onTiersChange(tiers.filter((t) => t.id !== id));
  };

  const addReward = (tierIndex: number) => {
    const updated = [...tiers];
    updated[tierIndex].rewards.push('');
    onTiersChange(updated);
  };

  const removeReward = (tierIndex: number, rewardIndex: number) => {
    const updated = [...tiers];
    updated[tierIndex].rewards.splice(rewardIndex, 1);
    onTiersChange(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Reward Tiers</h3>
          <p className="text-sm text-zinc-400">Configure XP thresholds and rewards</p>
        </div>
        <Button
          onClick={addTier}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Tier
        </Button>
      </div>

      <div className="space-y-4">
        {tiers.map((tier, tierIndex) => (
          <div
            key={tier.id}
            className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Input
                value={tier.name}
                onChange={(e) => {
                  const updated = [...tiers];
                  updated[tierIndex].name = e.target.value;
                  onTiersChange(updated);
                }}
                placeholder="Tier name (e.g., Gold)"
                className="flex-1 mr-2 bg-zinc-800 border-zinc-700 text-white"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTier(tier.id)}
                className="h-8 w-8 p-0 hover:bg-red-950 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <Label className="text-zinc-400 text-xs">XP Threshold</Label>
              <Input
                type="number"
                value={tier.xpThreshold}
                onChange={(e) => {
                  const updated = [...tiers];
                  updated[tierIndex].xpThreshold = parseInt(e.target.value) || 0;
                  onTiersChange(updated);
                }}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-zinc-400 text-xs">Rewards</Label>
                <Button
                  onClick={() => addReward(tierIndex)}
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-purple-400 hover:text-purple-300"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {tier.rewards.map((reward: string, rewardIndex: number) => (
                  <div key={rewardIndex} className="flex items-center gap-2">
                    <Input
                      value={reward}
                      onChange={(e) => {
                        const updated = [...tiers];
                        updated[tierIndex].rewards[rewardIndex] = e.target.value;
                        onTiersChange(updated);
                      }}
                      placeholder="Reward description"
                      className="flex-1 bg-zinc-800 border-zinc-700 text-white text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReward(tierIndex, rewardIndex)}
                      className="h-8 w-8 p-0 hover:bg-red-950 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Members Tab Content Component
const MembersTabContent: React.FC<{
  members: any[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onMembersChange: (val: any[]) => void;
}> = ({ members, searchQuery, onSearchChange, onMembersChange }) => {
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateMemberRole = (index: number, role: string) => {
    const updated = [...members];
    updated[index].role = role;
    onMembersChange(updated);
  };

  const removeMember = (id: string) => {
    onMembersChange(members.filter((m) => m.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search members..."
          className="pl-10 bg-zinc-900 border-zinc-800 text-white rounded-xl"
        />
      </div>

      <div className="space-y-2">
        {filteredMembers.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                {member.name[0]}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{member.name}</p>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs',
                    member.role === 'Creator' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                    member.role === 'Moderator' && 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                    member.role === 'Member' && 'bg-zinc-700 text-zinc-300'
                  )}
                >
                  {member.role === 'Creator' && <Crown className="w-3 h-3 mr-1" />}
                  {member.role === 'Moderator' && <Shield className="w-3 h-3 mr-1" />}
                  {member.role}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={member.role}
                onValueChange={(val) => updateMemberRole(index, val)}
              >
                <SelectTrigger className="w-[130px] h-8 bg-zinc-800 border-zinc-700 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="Member" className="text-white">Member</SelectItem>
                  <SelectItem value="Moderator" className="text-white">Moderator</SelectItem>
                  <SelectItem value="Creator" className="text-white">Creator</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMember(member.id)}
                className="h-8 w-8 p-0 hover:bg-red-950 hover:text-red-400"
              >
                <UserMinus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Branding Tab Content Component
const BrandingTabContent: React.FC<{
  profileIcon: string;
  onProfileIconChange: (val: string) => void;
  bannerImage: string;
  onBannerImageChange: (val: string) => void;
  colorTheme: string;
  onColorThemeChange: (val: string) => void;
  colorThemes: any[];
}> = ({
  profileIcon,
  onProfileIconChange,
  bannerImage,
  onBannerImageChange,
  colorTheme,
  onColorThemeChange,
  colorThemes,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <Label className="text-white mb-2">Profile Icon</Label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
            {profileIcon ? (
              <img src={profileIcon} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-8 h-8 text-zinc-600" />
            )}
          </div>
          <Button
            size="sm"
            className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      <div>
        <Label className="text-white mb-2">Banner Image</Label>
        <div className="space-y-3">
          <div className="w-full h-32 rounded-xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
            {bannerImage ? (
              <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-8 h-8 text-zinc-600" />
            )}
          </div>
          <Button
            size="sm"
            className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Banner
          </Button>
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      <div>
        <Label className="text-white mb-3">Color Theme</Label>
        <div className="grid grid-cols-1 gap-3">
          {colorThemes.map((theme) => (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onColorThemeChange(theme.id)}
              className={cn(
                'p-4 rounded-xl border-2 transition-all duration-300',
                colorTheme === theme.id
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg bg-gradient-to-r',
                    theme.gradient
                  )}
                />
                <span className="text-white font-medium">{theme.name}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Settings Tab Content Component
const SettingsTabContent: React.FC<{
  isPublic: boolean;
  onIsPublicChange: (val: boolean) => void;
  commentsEnabled: boolean;
  onCommentsEnabledChange: (val: boolean) => void;
  pinnedPostsEnabled: boolean;
  onPinnedPostsEnabledChange: (val: boolean) => void;
  autoApproveMembers: boolean;
  onAutoApproveMembersChange: (val: boolean) => void;
}> = ({
  isPublic,
  onIsPublicChange,
  commentsEnabled,
  onCommentsEnabledChange,
  pinnedPostsEnabled,
  onPinnedPostsEnabledChange,
  autoApproveMembers,
  onAutoApproveMembersChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            {isPublic ? <Eye className="w-5 h-5 text-green-400" /> : <EyeOff className="w-5 h-5 text-zinc-400" />}
            <div>
              <p className="text-white font-medium">Visibility</p>
              <p className="text-sm text-zinc-400">
                {isPublic ? 'Public - Anyone can join' : 'Private - Invite only'}
              </p>
            </div>
          </div>
          <Switch checked={isPublic} onCheckedChange={onIsPublicChange} />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">Comments</p>
              <p className="text-sm text-zinc-400">Allow members to comment on posts</p>
            </div>
          </div>
          <Switch checked={commentsEnabled} onCheckedChange={onCommentsEnabledChange} />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            <Pin className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-white font-medium">Pinned Posts</p>
              <p className="text-sm text-zinc-400">Enable pinning important posts</p>
            </div>
          </div>
          <Switch checked={pinnedPostsEnabled} onCheckedChange={onPinnedPostsEnabledChange} />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-white font-medium">Auto-Approve Members</p>
              <p className="text-sm text-zinc-400">Automatically approve join requests</p>
            </div>
          </div>
          <Switch checked={autoApproveMembers} onCheckedChange={onAutoApproveMembersChange} />
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      {/* Danger Zone */}
      <div className="p-6 bg-red-950/20 rounded-xl border-2 border-red-900/50">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-bold">Danger Zone</h3>
            <p className="text-sm text-red-300/70 mt-1">
              Deleting your community is permanent and cannot be undone
            </p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Community
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
