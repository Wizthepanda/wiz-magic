import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, X, Sparkles, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

export const EditProfileTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        setFormData({
          displayName: user.displayName || userData?.displayName || '',
          username: userData?.username || '@' + (user.displayName?.toLowerCase().replace(/\s+/g, '') || 'user'),
          email: user.email || '',
          bio: userData?.bio || '',
        });
        
        setAvatarPreview(user.photoURL || '');
        setBannerPreview(userData?.bannerImage || '');
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max for banner)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setBannerFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!formData.username.startsWith('@')) {
      newErrors.username = 'Username must start with @';
    }

    if (formData.bio.split(' ').filter(Boolean).length > 50) {
      newErrors.bio = 'Bio must be 50 words or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      let photoURL = user.photoURL;
      let bannerURL = bannerPreview; // Keep existing banner if no new upload

      // Upload new avatar if selected
      if (avatarFile) {
        const avatarRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${avatarFile.name}`);
        await uploadBytes(avatarRef, avatarFile);
        photoURL = await getDownloadURL(avatarRef);
      }

      // Upload new banner if selected
      if (bannerFile) {
        const bannerRef = ref(storage, `banners/${user.uid}/${Date.now()}_${bannerFile.name}`);
        await uploadBytes(bannerRef, bannerFile);
        bannerURL = await getDownloadURL(bannerRef);
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: photoURL || user.photoURL,
      });

      // Update Firestore user document
      await setDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        photoURL: photoURL,
        bannerImage: bannerURL,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setSaved(true);
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Profile Updated! ✨",
        description: "Your changes have been saved successfully",
      });

      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      displayName: user?.displayName || '',
      username: formData.username, // Keep username as it doesn't come from auth
      email: user?.email || '',
      bio: formData.bio,
    });
    setAvatarFile(null);
    setAvatarPreview(user?.photoURL || '');
    setBannerFile(null);
    // Keep banner preview from database
    setErrors({});
  };

  const bioWordCount = formData.bio.split(' ').filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-8"
    >
      {/* Left: Live Preview */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Live Preview</h3>
        
        <Card className="border-0 bg-gradient-to-br from-[#8B5CF6]/10 to-[#C084FC]/10 backdrop-blur-xl shadow-lg sticky top-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                  <AvatarImage src={avatarPreview || user?.photoURL || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#C084FC] text-white text-2xl">
                    {formData.displayName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C084FC] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Info */}
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {formData.displayName || 'Your Name'}
              </h3>
              <p className="text-sm text-slate-500 mb-3">{formData.username}</p>
              
              <Badge className="bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] text-white border-0 mb-4">
                Level 1
              </Badge>

              <p className="text-sm text-slate-600 leading-relaxed">
                {formData.bio || 'Add a bio to introduce yourself...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Right: Edit Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] bg-clip-text text-transparent mb-6">
          Edit Profile
        </h3>

        <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Profile Picture
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-[#8B5CF6]/30 rounded-2xl p-6 text-center cursor-pointer hover:border-[#8B5CF6]/60 transition-colors group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-[#C084FC]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Upload className="w-8 h-8 text-[#8B5CF6] mx-auto mb-2 relative z-10" />
                <p className="text-sm font-medium text-slate-700 relative z-10">
                  {avatarFile ? avatarFile.name : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-slate-500 mt-1 relative z-10">PNG, JPG up to 5MB</p>
              </motion.div>
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Profile Banner
              </label>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => bannerInputRef.current?.click()}
                className="relative border-2 border-dashed border-[#8B5CF6]/30 rounded-2xl overflow-hidden cursor-pointer hover:border-[#8B5CF6]/60 transition-colors group"
              >
                {bannerPreview ? (
                  <div className="relative h-32 w-full">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-[#C084FC]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Upload className="w-8 h-8 text-[#8B5CF6] mx-auto mb-2 relative z-10" />
                    <p className="text-sm font-medium text-slate-700 relative z-10">
                      Click to upload banner image
                    </p>
                    <p className="text-xs text-slate-500 mt-1 relative z-10">Recommended: 1200x300px, PNG or JPG up to 10MB</p>
                  </div>
                )}
                {bannerFile && (
                  <div className="absolute top-2 right-2 bg-[#8B5CF6] text-white text-xs px-2 py-1 rounded-full">
                    {bannerFile.name}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Display Name
              </label>
              <div className="relative">
                <Input
                  value={formData.displayName}
                  onChange={(e) => {
                    setFormData({ ...formData, displayName: e.target.value });
                    if (errors.displayName) {
                      setErrors({ ...errors, displayName: '' });
                    }
                  }}
                  className={`border-2 transition-colors ${
                    errors.displayName 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-200 focus:border-[#8B5CF6]'
                  }`}
                  placeholder="Enter your display name"
                />
                {errors.displayName && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.displayName}
                  </div>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>
              <Input
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  if (errors.username) {
                    setErrors({ ...errors, username: '' });
                  }
                }}
                className={`border-2 transition-colors ${
                  errors.username 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-slate-200 focus:border-[#8B5CF6]'
                }`}
                placeholder="@username"
              />
              {errors.username && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.username}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <Input
                value={formData.email}
                disabled
                className="border-2 border-slate-200 bg-slate-50 cursor-not-allowed"
                placeholder="your@email.com"
                type="email"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Bio */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Bio
                </label>
                <span className={`text-xs ${
                  bioWordCount > 50 ? 'text-red-600 font-semibold' : 'text-slate-500'
                }`}>
                  {bioWordCount} / 50 words
                </span>
              </div>
              <div className="relative">
                <Textarea
                  value={formData.bio}
                  onChange={(e) => {
                    setFormData({ ...formData, bio: e.target.value });
                    if (errors.bio) {
                      setErrors({ ...errors, bio: '' });
                    }
                  }}
                  className={`border-2 transition-colors min-h-[120px] resize-none ${
                    errors.bio 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-200 focus:border-[#8B5CF6]'
                  }`}
                  placeholder="Tell us about yourself..."
                />
                <motion.div
                  className="absolute inset-0 -z-10 rounded-lg"
                  animate={{
                    boxShadow: formData.bio.length > 0 && !errors.bio
                      ? '0 0 20px rgba(139, 92, 246, 0.2)' 
                      : '0 0 0px rgba(139, 92, 246, 0)',
                  }}
                />
              </div>
              {errors.bio && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.bio}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] hover:from-[#7C3AED] hover:to-[#A855F7] text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mr-2"
                      >
                        ✓
                      </motion.div>
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </motion.div>

              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-2 border-slate-300 hover:bg-slate-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>

            {/* Success Feedback */}
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-green-50 border border-green-200 text-center"
              >
                <p className="text-sm text-green-700 font-medium">
                  ✨ Profile updated successfully!
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

