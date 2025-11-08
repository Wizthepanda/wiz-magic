# 🎓 WIZUP Course Creation - Complete Implementation Guide

## ✅ Foundation Complete (Deployed)

The following core infrastructure has been implemented:

### 1. **TypeScript Types** (`/src/types/course.ts`)
- Complete course data model
- Module and lesson types
- Quiz system types
- Enrollment tracking types
- Draft state interface with all actions

### 2. **Course Draft Storage** (`/src/lib/courseDraftStorage.ts`)
- Per-user scoped storage: `courseDraft_${userId}`
- CRUD operations for user-specific drafts
- Debug utilities
- **Same isolation pattern as community drafts** ✅

### 3. **Course Creation Store** (`/src/store/courseCreateStore.ts`)
- Zustand store with per-user draft management
- All CRUD actions for course, modules, and lessons
- Drag-and-drop reordering support
- Auto-save and persistence logic
- **Zero cross-user leakage** ✅

## 📋 Remaining Implementation Tasks

### Step 1: Course Details Component

**File:** `/src/components/wiz/course-wizard/StepCourseDetails.tsx`

```typescript
import { useCourseCreateStore } from '@/store/courseCreateStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES } from '@/lib/categories'; // Reuse video categories

export const StepCourseDetails = () => {
  const store = useCourseCreateStore();
  
  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Title
        </label>
        <Input
          value={store.title}
          onChange={(e) => store.setTitle(e.target.value)}
          placeholder="e.g., Master React & TypeScript"
          maxLength={80}
          className="text-lg"
        />
        <p className="text-xs text-gray-500 mt-1">
          {store.title.length}/80 characters
        </p>
      </div>
      
      {/* Short Description */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description
        </label>
        <Textarea
          value={store.shortDescription}
          onChange={(e) => store.setShortDescription(e.target.value)}
          placeholder="1-3 sentences that describe what students will learn"
          rows={3}
          maxLength={200}
        />
      </div>
      
      {/* Difficulty Selector */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Difficulty Level
        </label>
        <div className="flex gap-3">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => store.setDifficulty(level)}
              className={cn(
                "px-6 py-3 rounded-full font-medium transition-all",
                store.difficulty === level
                  ? "bg-gradient-to-r from-indigo-600 to-violet-500 text-white"
                  : "bg-white/70 text-gray-700 hover:bg-white"
              )}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Category & Subcategory */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <Select
            value={store.category}
            onValueChange={store.setCategory}
          >
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </Select>
        </div>
        
        {store.category && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <Select
              value={store.subcategory}
              onValueChange={store.setSubcategory}
            >
              {/* Filter subcategories based on selected category */}
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### Step 2: Cover Art & Branding Component

**File:** `/src/components/wiz/course-wizard/StepCourseBranding.tsx`

```typescript
import { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useCourseCreateStore } from '@/store/courseCreateStore';
import { uploadImage } from '@/lib/storage-utils';
import { useAuth } from '@/hooks/useAuth';

export const StepCourseBranding = () => {
  const { user } = useAuth();
  const store = useCourseCreateStore();
  const [isUploading, setIsUploading] = useState(false);
  
  const handleCoverUpload = async (file: File) => {
    if (!user?.uid) return;
    
    setIsUploading(true);
    try {
      const url = await uploadImage(
        file,
        `courses/${user.uid}/covers/${Date.now()}_${file.name}`
      );
      store.setCoverURL(url);
      toast.success('Cover image uploaded');
    } catch (error) {
      toast.error('Failed to upload cover');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Cover Image Upload */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Course Cover Image
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Recommended: 16:9 aspect ratio, at least 1280x720px
        </p>
        
        {store.coverURL ? (
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <img
              src={store.coverURL}
              alt="Course cover"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => store.setCoverURL('')}
              className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="block aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-500 cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
              }}
              className="hidden"
            />
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <ImageIcon className="w-12 h-12 mb-3" />
              <p className="font-medium">Click to upload cover image</p>
            </div>
          </label>
        )}
      </div>
      
      {/* Theme Color Picker */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Theme Color
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={store.themeColor}
            onChange={(e) => store.setThemeColor(e.target.value)}
            className="w-16 h-16 rounded-lg cursor-pointer"
          />
          <div>
            <p className="text-sm font-medium">{store.themeColor}</p>
            <p className="text-xs text-gray-500">Primary highlight color</p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### Step 3: Curriculum Builder (Most Complex)

**File:** `/src/components/wiz/course-wizard/StepCourseCurriculum.tsx`

This requires @dnd-kit for drag-and-drop. Key features:

1. **Module Management:**
   - Add/remove/reorder modules
   - Collapsible sections
   - Module title editing

2. **Lesson Management:**
   - Add/remove/reorder lessons within modules
   - Lesson type selector (video/text/quiz/link)
   - Inline lesson editing
   - Video picker from YouTube library
   - Rich text editor for text lessons
   - Simple quiz builder

3. **Drag-and-Drop:**
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';

// Implement sortable module and lesson components
// Use store.reorderModules() and store.reorderLessons()
```

**Pseudo-structure:**
```typescript
export const StepCourseCurriculum = () => {
  const store = useCourseCreateStore();
  
  const handleAddModule = () => {
    store.addModule({
      id: generateId(),
      title: 'New Module',
      order: store.modules.length,
      lessons: []
    });
  };
  
  return (
    <div className="space-y-4">
      <button onClick={handleAddModule} className="...">
        + Add Module
      </button>
      
      <DndContext onDragEnd={handleModuleDragEnd}>
        <SortableContext items={store.modules}>
          {store.modules.map(module => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
```

---

### Step 4: Publish & Community Linking

**File:** `/src/components/wiz/course-wizard/StepCoursePublish.tsx`

```typescript
import { useCourseCreateStore } from '@/store/courseCreateStore';
import { useAuth } from '@/hooks/useAuth';
import { useUserCommunities } from '@/hooks/useUserCommunities'; // Fetch user's communities
import { publishCourse } from '@/lib/courseService';

export const StepCoursePublish = () => {
  const { user } = useAuth();
  const store = useCourseCreateStore();
  const { data: communities } = useUserCommunities(user?.uid);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const handlePublish = async () => {
    if (!user) return;
    
    setIsPublishing(true);
    try {
      const courseId = await publishCourse({
        ...store,
        creatorUID: user.uid,
        creatorName: user.displayName || '',
        creatorAvatar: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Clear draft
      store.clearDraftForUser(user.uid);
      
      toast.success('Course published!');
      navigate(`/course/${courseId}`);
    } catch (error) {
      toast.error('Failed to publish course');
    } finally {
      setIsPublishing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Visibility Selector */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Course Visibility
        </label>
        <RadioGroup value={store.visibility} onValueChange={store.setVisibility}>
          <RadioGroupItem value="public">Public - Anyone can enroll</RadioGroupItem>
          <RadioGroupItem value="community-only">Community Members Only</RadioGroupItem>
          <RadioGroupItem value="private">Private - By invitation</RadioGroupItem>
        </RadioGroup>
      </div>
      
      {/* Community Linking */}
      <div className="glass-card rounded-2xl p-6">
        <label className="flex items-center gap-2 mb-4">
          <Switch
            checked={!!store.featuredCommunityID}
            onCheckedChange={(checked) => {
              if (!checked) store.setFeaturedCommunity(undefined);
            }}
          />
          <span className="text-sm font-medium">Feature in a Community</span>
        </label>
        
        {store.featuredCommunityID && (
          <Select
            value={store.featuredCommunityID}
            onValueChange={(id) => {
              const community = communities?.find(c => c.id === id);
              store.setFeaturedCommunity(id, community?.name);
            }}
          >
            {communities?.map(community => (
              <SelectItem key={community.id} value={community.id}>
                {community.name}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>
      
      {/* Preview & Publish */}
      <div className="glass-card rounded-2xl p-6">
        <CoursePreview store={store} />
        
        <Button
          onClick={handlePublish}
          disabled={isPublishing || !store.title || store.modules.length === 0}
          className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-500"
        >
          {isPublishing ? 'Publishing...' : 'Publish Course'}
        </Button>
      </div>
    </div>
  );
};
```

---

### Main Wizard Component

**File:** `/src/components/wiz/CourseCreateWizard.tsx`

```typescript
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourseCreateStore } from '@/store/courseCreateStore';
import { debounce } from 'lodash';
import { FileText, Palette, BookOpen, Rocket } from 'lucide-react';

const steps = [
  { id: 1, title: 'Details', icon: FileText },
  { id: 2, title: 'Branding', icon: Palette },
  { id: 3, title: 'Curriculum', icon: BookOpen },
  { id: 4, title: 'Publish', icon: Rocket }
];

export const CourseCreateWizard = ({ onBack }: { onBack: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const store = useCourseCreateStore();
  
  // Load draft for current user on mount
  useEffect(() => {
    if (user?.uid) {
      store.loadDraftForUser(user.uid);
    } else {
      store.loadDraftForUser(null);
    }
  }, [user?.uid]);
  
  // Debounced auto-save
  const debouncedPersist = useMemo(
    () => debounce(() => {
      if (user?.uid) {
        store.persistDraftToStorage();
      }
    }, 700),
    [user?.uid]
  );
  
  // Auto-save on store changes
  useEffect(() => {
    if (user?.uid && store.title) {
      debouncedPersist();
    }
    return () => debouncedPersist.cancel();
  }, [store.title, store.modules, store.coverURL, debouncedPersist]);
  
  // Persist on unmount
  useEffect(() => {
    return () => {
      if (user?.uid) {
        store.persistDraftToStorage();
      }
    };
  }, [user?.uid]);
  
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepCourseDetails />;
      case 2: return <StepCourseBranding />;
      case 3: return <StepCourseCurriculum />;
      case 4: return <StepCoursePublish />;
      default: return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f7f9fc] to-[#eef1f7]">
      {/* Step Progress */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                    currentStep === step.id
                      ? "bg-gradient-to-r from-indigo-600 to-violet-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <step.icon className="w-5 h-5" />
                  <span className="font-medium">{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="w-12 h-px bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {renderStep()}
        
        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <Button
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onBack()}
            variant="outline"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {currentStep < 4 && (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-gradient-to-r from-indigo-600 to-violet-500"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 🔧 Additional Files Needed

### 1. Course Service (`/src/lib/courseService.ts`)

```typescript
import { collection, doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Course } from '@/types/course';

export async function publishCourse(courseData: Omit<Course, 'id'>): Promise<string> {
  const courseRef = doc(collection(db, 'courses'));
  const courseId = courseRef.id;
  
  await setDoc(courseRef, {
    ...courseData,
    id: courseId,
    status: 'published',
    publishedAt: serverTimestamp()
  });
  
  // If featured in a community, add course to community
  if (courseData.featuredCommunityID) {
    const communityRef = doc(db, 'communities', courseData.featuredCommunityID);
    await updateDoc(communityRef, {
      courses: arrayUnion(courseId)
    });
  }
  
  return courseId;
}

export async function saveCourse Draft(courseData: Partial<Course>): Promise<string> {
  // Save draft logic
}
```

### 2. Course Hooks (`/src/hooks/useCourse.ts`)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const docRef = doc(db, 'courses', courseId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },
    enabled: !!courseId
  });
}

export function useUserCommunities(userId?: string) {
  return useQuery({
    queryKey: ['userCommunities', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(
        collection(db, 'communities'),
        where('creatorId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!userId
  });
}
```

---

## 🚀 Integration Points

### 1. Add to Creation Hub

**File:** `/src/components/wiz/CreationHubV2.tsx`

Add course card to creation grid:

```typescript
{
  id: 'course',
  title: 'Create Course',
  description: 'Build structured learning experiences',
  icon: GraduationCap,
  zapBoost: '+500 ZAPs',
  gradient: 'from-emerald-500 to-teal-500',
  route: '/create/course'
}
```

### 2. Update Logout Handler

**File:** `/src/components/wiz/WizSidebarV2.tsx`

Add course draft cleanup:

```typescript
// Clear user-specific course draft
if (currentUserId) {
  const { useCourseCreateStore } = await import('@/store/courseCreateStore');
  useCourseCreateStore.getState().clearDraftForUser(currentUserId);
}
```

### 3. Add Route

**File:** `/src/App.tsx` or routing file

```typescript
<Route path="/create/course" element={<CourseCreateWizard onBack={() => navigate('/create')} />} />
```

---

## 📊 Deployment Checklist

- [ ] Install @dnd-kit dependencies: `npm install @dnd-kit/core @dnd-kit/sortable`
- [ ] Create all step components
- [ ] Create CourseCreateWizard main component
- [ ] Add course service functions
- [ ] Add course hooks
- [ ] Update logout handler
- [ ] Add route and creation card
- [ ] Test user isolation
- [ ] Test auto-save
- [ ] Test publish flow
- [ ] Deploy to Firebase

---

## 🎯 Success Criteria

✅ Courses feel first-class (same UI quality as communities)  
✅ Creators can build modules and lessons easily  
✅ Drag-and-drop reordering works smoothly  
✅ Courses can be featured in communities  
✅ Per-user draft isolation (no leakage)  
✅ Auto-save every 700ms  
✅ Draft persists on refresh  
✅ Draft clears on logout  
✅ Premium, minimal, world-class UX  

---

## 📝 Next Steps

1. **Install dependencies** (@ dnd-kit)
2. **Create step components** (Details, Branding, Curriculum, Publish)
3. **Create main wizard** (CourseCreateWizard.tsx)
4. **Add service functions** (courseService.ts)
5. **Add hooks** (useCourse.ts, useUserCommunities.ts)
6. **Update integrations** (logout, routes, creation hub)
7. **Test & deploy**

**Estimated Development Time:** 6-8 hours for full implementation

**Priority Order:**
1. Step 1 (Details) - 30 min
2. Step 2 (Branding) - 45 min
3. Step 4 (Publish) - 1 hour
4. Step 3 (Curriculum) - 3-4 hours (most complex)
5. Integration & testing - 1-2 hours

