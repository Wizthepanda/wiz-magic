import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  X,
  Zap,
  Gift,
  Users,
  Trophy,
  Edit,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCommunityCreateStore, ZAPRewardTier } from '@/store/communityCreateStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const tierTriggerOptions = [
  { value: 'join', label: 'Join Bonus', description: 'One-time reward when joining', icon: Gift },
  { value: 'milestone', label: 'Milestone', description: 'Complete specific achievements', icon: Trophy },
  { value: 'referral', label: 'Referral', description: 'Invite new members', icon: Users },
  { value: 'custom', label: 'Custom', description: 'Define your own trigger', icon: Sparkles }
];

const emojiOptions = ['🎁', '🏆', '⚡', '💎', '🌟', '🔥', '👑', '💰', '🎯', '🚀'];

const badgeColorOptions = [
  { value: 'purple', label: 'Purple', gradient: 'from-purple-500 to-pink-500' },
  { value: 'blue', label: 'Blue', gradient: 'from-blue-500 to-cyan-500' },
  { value: 'green', label: 'Green', gradient: 'from-emerald-500 to-teal-500' },
  { value: 'orange', label: 'Orange', gradient: 'from-orange-500 to-amber-500' },
  { value: 'red', label: 'Red', gradient: 'from-red-500 to-rose-500' },
];

export const StepContent: React.FC = () => {
  const store = useCommunityCreateStore();
  const navigate = useNavigate();

  // Course Integration State
  const [showCourseDialog, setShowCourseDialog] = useState(false);

  // ZAP Reward Tier State
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierForm, setTierForm] = useState<Partial<ZAPRewardTier>>({
    name: '',
    trigger: 'join',
    amount: 50,
    emoji: '🎁',
    description: '',
    badgeColor: 'purple'
  });

  const handleOpenRewardDialog = (tier?: ZAPRewardTier) => {
    if (tier) {
      setEditingTierId(tier.id);
      setTierForm(tier);
    } else {
      setEditingTierId(null);
      setTierForm({
        name: '',
        trigger: 'join',
        amount: 50,
        emoji: '🎁',
        description: '',
        badgeColor: 'purple'
      });
    }
    setShowRewardDialog(true);
  };

  const handleSaveRewardTier = () => {
    if (!tierForm.name || !tierForm.amount || tierForm.amount <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingTierId) {
      // Update existing tier
      store.updateZapRewardTier(editingTierId, tierForm as ZAPRewardTier);
      toast.success('Reward tier updated');
    } else {
      // Add new tier
      const newTier: ZAPRewardTier = {
        id: `tier-${Date.now()}`,
        name: tierForm.name!,
        trigger: tierForm.trigger!,
        amount: tierForm.amount!,
        emoji: tierForm.emoji!,
        description: tierForm.description,
        badgeColor: tierForm.badgeColor!
      };
      store.addZapRewardTier(newTier);
      toast.success('Reward tier added');
    }

    setShowRewardDialog(false);
  };

  const handleRemoveRewardTier = (tierId: string) => {
    store.removeZapRewardTier(tierId);
    toast.success('Reward tier removed');
  };

  const handleRemoveCourse = (courseId: string) => {
    store.removeLinkedCourse(courseId);
    toast.success('Course removed');
  };

  const handleCreateNewCourse = () => {
    toast.info('Redirecting to course creation...');
    // TODO: Implement course creation navigation
    // navigate('/creator-dashboard/courses/new');
  };

  const getGradientClass = (color: string) => {
    const found = badgeColorOptions.find(opt => opt.value === color);
    return found?.gradient || 'from-purple-500 to-pink-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Course Integration Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Course Integration</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Link existing courses or create new ones for your community
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {store.linkedCourses.length} Linked
          </Badge>
        </div>

        {/* Course Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => setShowCourseDialog(true)}
            variant="outline"
            className="h-24 border-2 border-dashed hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <div className="flex flex-col items-center space-y-2">
              <Plus className="w-6 h-6 text-purple-600" />
              <span className="font-medium">Add Existing Course</span>
            </div>
          </Button>

          <Button
            onClick={handleCreateNewCourse}
            variant="outline"
            className="h-24 border-2 border-dashed hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="flex flex-col items-center space-y-2">
              <ExternalLink className="w-6 h-6 text-blue-600" />
              <span className="font-medium">Create New Course</span>
            </div>
          </Button>
        </div>

        {/* Linked Courses Display */}
        {store.linkedCourses.length > 0 && (
          <div className="space-y-3 mt-4">
            <Label className="text-sm font-medium text-gray-700">Linked Courses</Label>
            <div className="grid grid-cols-1 gap-3">
              {store.linkedCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center overflow-hidden">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.name} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{course.name}</h4>
                        <p className="text-xs text-gray-500">Linked to community</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCourse(course.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* ZAP Reward Tiers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span>ZAP Reward Tiers</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Set up rewards to incentivize member engagement
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {store.zapRewardTiers.length} Tiers
          </Badge>
        </div>

        {/* Add Reward Tier Button */}
        <Button
          onClick={() => handleOpenRewardDialog()}
          variant="outline"
          className="w-full h-16 border-2 border-dashed hover:border-yellow-500 hover:bg-yellow-50 transition-all"
        >
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">Add Reward Tier</span>
          </div>
        </Button>

        {/* Reward Tiers Display */}
        {store.zapRewardTiers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {store.zapRewardTiers.map((tier) => {
              const TriggerIcon = tierTriggerOptions.find(opt => opt.value === tier.trigger)?.icon || Gift;
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  className="relative group"
                >
                  {/* Animated Ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className={cn(
                      "absolute -inset-1 rounded-2xl blur-sm opacity-50",
                      `bg-gradient-to-r ${getGradientClass(tier.badgeColor)}`
                    )}
                  />

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-5 space-y-3">
                      {/* Header with Emoji and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                            `bg-gradient-to-br ${getGradientClass(tier.badgeColor)}`
                          )}>
                            {tier.emoji}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{tier.name}</h4>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <TriggerIcon className="w-3 h-3" />
                              <span>{tierTriggerOptions.find(opt => opt.value === tier.trigger)?.label}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRewardDialog(tier)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRewardTier(tier.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      {tier.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{tier.description}</p>
                      )}

                      {/* ZAP Amount Badge */}
                      <div className={cn(
                        "inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-white font-semibold text-sm",
                        `bg-gradient-to-r ${getGradientClass(tier.badgeColor)}`
                      )}>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>+{tier.amount} ZAPs</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Selection Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Existing Course</DialogTitle>
            <DialogDescription>
              Select a course from your library to link to this community
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 text-center">
              No courses available. Create your first course to link it here.
            </p>
            <Button
              onClick={handleCreateNewCourse}
              className="w-full mt-4"
            >
              Create New Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reward Tier Dialog */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTierId ? 'Edit Reward Tier' : 'Add Reward Tier'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Tier Name */}
            <div className="space-y-2">
              <Label htmlFor="tierName">Tier Name *</Label>
              <Input
                id="tierName"
                placeholder="e.g., Welcome Bonus"
                value={tierForm.name}
                onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
              />
            </div>

            {/* Trigger Type */}
            <div className="space-y-2">
              <Label>Trigger Type *</Label>
              <Select
                value={tierForm.trigger}
                onValueChange={(val) => setTierForm({ ...tierForm, trigger: val as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tierTriggerOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* ZAP Amount */}
            <div className="space-y-2">
              <Label htmlFor="zapAmount">ZAP Amount *</Label>
              <Input
                id="zapAmount"
                type="number"
                min="1"
                placeholder="50"
                value={tierForm.amount}
                onChange={(e) => setTierForm({ ...tierForm, amount: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Emoji Selection */}
            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="grid grid-cols-5 gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setTierForm({ ...tierForm, emoji })}
                    className={cn(
                      "w-12 h-12 rounded-lg border-2 text-2xl transition-all",
                      tierForm.emoji === emoji
                        ? "border-purple-500 bg-purple-50 scale-110"
                        : "border-gray-200 hover:border-purple-300"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge Color */}
            <div className="space-y-2">
              <Label>Badge Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {badgeColorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setTierForm({ ...tierForm, badgeColor: color.value })}
                    className={cn(
                      "h-10 rounded-lg transition-all",
                      `bg-gradient-to-r ${color.gradient}`,
                      tierForm.badgeColor === color.value
                        ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                        : "opacity-70 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="tierDescription">Description (Optional)</Label>
              <Input
                id="tierDescription"
                placeholder="Brief description of this reward..."
                value={tierForm.description}
                onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRewardDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRewardTier}>
              {editingTierId ? 'Update Tier' : 'Add Tier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
