import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Tag, Info } from 'lucide-react';
import { useCourseCreateStore } from '@/store/courseCreateStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = [
  { id: 'tech', name: 'Technology & Programming', subcategories: ['Web Development', 'Mobile Development', 'Data Science', 'AI & Machine Learning', 'Cybersecurity'] },
  { id: 'business', name: 'Business & Entrepreneurship', subcategories: ['Marketing', 'Sales', 'Finance', 'Management', 'Startup'] },
  { id: 'creative', name: 'Creative Arts', subcategories: ['Design', 'Photography', 'Video Editing', 'Music', 'Writing'] },
  { id: 'personal', name: 'Personal Development', subcategories: ['Productivity', 'Communication', 'Leadership', 'Mindfulness', 'Fitness'] },
  { id: 'academic', name: 'Academic', subcategories: ['Mathematics', 'Science', 'History', 'Languages', 'Test Prep'] },
];

const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'No prior experience needed', color: 'from-green-500 to-emerald-500' },
  { id: 'intermediate', name: 'Intermediate', description: 'Some experience required', color: 'from-blue-500 to-cyan-500' },
  { id: 'advanced', name: 'Advanced', description: 'Expert-level content', color: 'from-purple-500 to-pink-500' },
];

export const StepCourseDetails: React.FC = () => {
  const store = useCourseCreateStore();
  const [newTag, setNewTag] = useState('');
  
  const selectedCategory = CATEGORIES.find(cat => cat.id === store.category);
  
  const handleAddTag = () => {
    if (newTag.trim() && store.tags.length < 5) {
      store.setTags([...store.tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    store.setTags(store.tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Course Title */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Course Title</h3>
        </div>
        
        <div>
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            What's your course about?
          </Label>
          <Input
            id="title"
            value={store.title}
            onChange={(e) => store.setTitle(e.target.value)}
            placeholder="e.g., Master React & TypeScript from Scratch"
            maxLength={80}
            className="mt-2 text-lg font-medium"
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              Make it clear and engaging
            </p>
            <p className="text-xs text-gray-500">
              {store.title.length}/80
            </p>
          </div>
        </div>
      </div>
      
      {/* Short Description */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Short Description</h3>
        </div>
        
        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Describe what students will learn (1-3 sentences)
          </Label>
          <Textarea
            id="description"
            value={store.shortDescription}
            onChange={(e) => store.setShortDescription(e.target.value)}
            placeholder="In this course, you'll learn how to build modern web applications using React and TypeScript. We'll cover everything from basic concepts to advanced patterns, with hands-on projects."
            rows={4}
            maxLength={300}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-2">
            {store.shortDescription.length}/300 characters
          </p>
        </div>
      </div>
      
      {/* Difficulty Level */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Level</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DIFFICULTY_LEVELS.map((level) => (
            <motion.button
              key={level.id}
              onClick={() => store.setDifficulty(level.id as any)}
              className={cn(
                "relative p-6 rounded-xl border-2 transition-all text-left",
                store.difficulty === level.id
                  ? "border-indigo-500 bg-indigo-50/50"
                  : "border-gray-200 bg-white/70 hover:border-gray-300 hover:bg-white"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {store.difficulty === level.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              <div className={cn(
                "inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3",
                `bg-gradient-to-r ${level.color}`
              )}>
                {level.name}
              </div>
              <p className="text-sm text-gray-600">{level.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Category & Subcategory */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2">
              Main Category
            </Label>
            <Select
              value={store.category}
              onValueChange={(value) => store.setCategory(value)}
            >
              <SelectTrigger id="category" className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {store.category && selectedCategory && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </Label>
              <Select
                value={store.subcategory || ''}
                onValueChange={(value) => store.setSubcategory(value)}
              >
                <SelectTrigger id="subcategory" className="mt-2">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map(subcat => (
                    <SelectItem key={subcat} value={subcat}>
                      {subcat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Tags */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
        </div>
        
        <div>
          <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
            Add up to 5 tags to help students find your course
          </Label>
          
          {/* Tag Input */}
          <div className="flex gap-2 mt-2">
            <Input
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Type a tag and press Enter"
              disabled={store.tags.length >= 5}
              className="flex-1"
            />
            <button
              onClick={handleAddTag}
              disabled={!newTag.trim() || store.tags.length >= 5}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              Add
            </button>
          </div>
          
          {/* Tags Display */}
          {store.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {store.tags.map((tag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-indigo-900"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            {store.tags.length}/5 tags added
          </p>
        </div>
      </div>
    </motion.div>
  );
};

