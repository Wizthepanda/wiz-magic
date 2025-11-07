import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Eye, Users, Lock, Globe, Sparkles } from 'lucide-react';
import { useCourseCreateStore } from '@/store/courseCreateStore';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { CourseVisibility } from '@/types/course';

export const StepCoursePublish: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useCourseCreateStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [linkToCommunity, setLinkToCommunity] = useState(!!store.featuredCommunityID);
  
  // Fetch user's communities
  const { data: communities = [], isLoading: isLoadingCommunities } = useQuery({
    queryKey: ['userCommunities', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const q = query(
        collection(db, 'communities'),
        where('creatorId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().title || doc.data().name,
        ...doc.data()
      }));
    },
    enabled: !!user?.uid
  });
  
  const handlePublish = async () => {
    if (!user) {
      toast.error('Please sign in to publish');
      return;
    }
    
    // Validation
    if (!store.title.trim()) {
      toast.error('Please add a course title');
      return;
    }
    if (!store.shortDescription.trim()) {
      toast.error('Please add a short description');
      return;
    }
    if (!store.category) {
      toast.error('Please select a category');
      return;
    }
    if (store.modules.length === 0) {
      toast.error('Please add at least one module');
      return;
    }
    if (!store.modules.some(m => m.lessons.length > 0)) {
      toast.error('Please add at least one lesson to your modules');
      return;
    }
    
    setIsPublishing(true);
    
    try {
      // Create course document
      const courseRef = doc(collection(db, 'courses'));
      const courseId = courseRef.id;
      
      const courseData = {
        id: courseId,
        title: store.title,
        shortDescription: store.shortDescription,
        longDescription: store.longDescription || '',
        difficulty: store.difficulty,
        category: store.category,
        subcategory: store.subcategory || '',
        tags: store.tags,
        
        coverURL: store.coverURL || '',
        bannerURL: store.bannerURL || '',
        themeColor: store.themeColor,
        
        modules: store.modules,
        
        visibility: store.visibility,
        featuredCommunityID: store.featuredCommunityID || null,
        featuredCommunityName: store.featuredCommunityName || null,
        
        creatorUID: user.uid,
        creatorName: user.displayName || 'Unknown Creator',
        creatorAvatar: user.photoURL || '',
        creatorUsername: (user as any).username || '',
        
        status: 'published',
        enrollmentCount: 0,
        rating: 0,
        reviewsCount: 0,
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
      };
      
      await setDoc(courseRef, courseData);
      
      // If linked to a community, update the community document
      if (store.featuredCommunityID) {
        const communityRef = doc(db, 'communities', store.featuredCommunityID);
        await updateDoc(communityRef, {
          courses: arrayUnion(courseId),
          updatedAt: serverTimestamp()
        });
      }
      
      // Clear the draft
      store.clearDraftForUser(user.uid);
      
      toast.success('🎉 Course published successfully!');
      
      // Navigate to course page (you'll need to create this)
      setTimeout(() => {
        navigate(`/discover`);
      }, 500);
      
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error('Failed to publish course. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };
  
  const totalLessons = store.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const isValid = store.title && store.shortDescription && store.category && store.modules.length > 0 && totalLessons > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Visibility Settings */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Course Visibility</h3>
        </div>
        
        <RadioGroup
          value={store.visibility}
          onValueChange={(value) => store.setVisibility(value as CourseVisibility)}
          className="space-y-3"
        >
          <div
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
              store.visibility === 'public'
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-gray-200 bg-white/50 hover:border-gray-300"
            )}
            onClick={() => store.setVisibility('public')}
          >
            <RadioGroupItem value="public" id="public" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="public" className="flex items-center gap-2 font-semibold text-gray-900 cursor-pointer">
                <Globe className="w-5 h-5 text-green-600" />
                Public
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Anyone can discover and enroll in your course
              </p>
            </div>
          </div>
          
          <div
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
              store.visibility === 'community-only'
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-gray-200 bg-white/50 hover:border-gray-300"
            )}
            onClick={() => store.setVisibility('community-only')}
          >
            <RadioGroupItem value="community-only" id="community-only" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="community-only" className="flex items-center gap-2 font-semibold text-gray-900 cursor-pointer">
                <Users className="w-5 h-5 text-blue-600" />
                Community Members Only
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Only members of your linked community can access this course
              </p>
            </div>
          </div>
          
          <div
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
              store.visibility === 'private'
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-gray-200 bg-white/50 hover:border-gray-300"
            )}
            onClick={() => store.setVisibility('private')}
          >
            <RadioGroupItem value="private" id="private" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="private" className="flex items-center gap-2 font-semibold text-gray-900 cursor-pointer">
                <Lock className="w-5 h-5 text-purple-600" />
                Private
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Only accessible by invitation or direct link
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>
      
      {/* Community Linking */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Feature in Community</h3>
          </div>
          <Switch
            checked={linkToCommunity}
            onCheckedChange={(checked) => {
              setLinkToCommunity(checked);
              if (!checked) {
                store.setFeaturedCommunity(undefined);
              }
            }}
          />
        </div>
        
        <p className="text-sm text-gray-600">
          Showcase this course inside one of your communities for easy access
        </p>
        
        {linkToCommunity && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {isLoadingCommunities ? (
              <div className="py-4 text-center text-sm text-gray-500">
                Loading your communities...
              </div>
            ) : communities.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  You don't have any communities yet. Create a community first to feature your course.
                </p>
              </div>
            ) : (
              <Select
                value={store.featuredCommunityID || ''}
                onValueChange={(value) => {
                  const community = communities.find(c => c.id === value);
                  store.setFeaturedCommunity(value, community?.name);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a community" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map(community => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Course Preview */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Preview</h3>
        
        <div className="bg-white/70 rounded-xl overflow-hidden border border-gray-200">
          {/* Cover Image */}
          {store.coverURL ? (
            <div className="aspect-video overflow-hidden">
              <img
                src={store.coverURL}
                alt={store.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Rocket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No cover image</p>
              </div>
            </div>
          )}
          
          {/* Course Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {store.title || 'Untitled Course'}
                </h4>
                <p className="text-sm text-gray-600">
                  {store.shortDescription || 'No description provided'}
                </p>
              </div>
              {store.themeColor && (
                <div
                  className="w-12 h-12 rounded-full flex-shrink-0 ml-4"
                  style={{ backgroundColor: store.themeColor }}
                />
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {store.difficulty && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                  {store.difficulty.charAt(0).toUpperCase() + store.difficulty.slice(1)}
                </span>
              )}
              {store.category && (
                <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                  {store.category}
                </span>
              )}
              {store.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{user?.displayName || 'You'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{store.modules.length}</span>
                <span>modules</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{totalLessons}</span>
                <span>lessons</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Publish Button */}
      <div className="glass-card rounded-2xl p-6">
        {!isValid && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 font-medium mb-2">
              Please complete the following before publishing:
            </p>
            <ul className="text-sm text-amber-700 space-y-1 ml-4">
              {!store.title && <li>• Add a course title</li>}
              {!store.shortDescription && <li>• Add a short description</li>}
              {!store.category && <li>• Select a category</li>}
              {store.modules.length === 0 && <li>• Add at least one module</li>}
              {totalLessons === 0 && <li>• Add at least one lesson</li>}
            </ul>
          </div>
        )}
        
        <Button
          onClick={handlePublish}
          disabled={isPublishing || !isValid}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-500 hover:shadow-xl transition-all"
        >
          {isPublishing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Publishing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              <span>Publish Course</span>
            </div>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          Your course will be visible according to your visibility settings
        </p>
      </div>
    </motion.div>
  );
};

