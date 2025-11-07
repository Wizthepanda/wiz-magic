import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BookOpen,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useCourseCreateStore } from '@/store/courseCreateStore';
import type { CourseModule, CourseLesson, LessonType } from '@/types/course';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LESSON_TYPES: Array<{ id: LessonType; name: string; icon: any; description: string }> = [
  { id: 'video', name: 'Video Lesson', icon: Video, description: 'Upload or link a video' },
  { id: 'text', name: 'Text Content', icon: FileText, description: 'Written content or article' },
  { id: 'quiz', name: 'Quiz', icon: HelpCircle, description: 'Test knowledge with questions' },
  { id: 'external-link', name: 'External Link', icon: LinkIcon, description: 'Link to external resource' },
];

// Sortable Module Component
const SortableModule: React.FC<{
  module: CourseModule;
  onUpdate: (id: string, updates: Partial<CourseModule>) => void;
  onRemove: (id: string) => void;
  onAddLesson: (moduleId: string) => void;
  onUpdateLesson: (moduleId: string, lessonId: string, updates: Partial<CourseLesson>) => void;
  onRemoveLesson: (moduleId: string, lessonId: string) => void;
}> = ({ module, onUpdate, onRemove, onAddLesson, onUpdateLesson, onRemoveLesson }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(module.title);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onUpdate(module.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };
  
  return (
    <div ref={setNodeRef} style={style} className="glass-card rounded-xl overflow-hidden">
      {/* Module Header */}
      <div className="flex items-center gap-3 p-4 bg-white/70">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-gray-900"
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        
        <BookOpen className="w-5 h-5 text-indigo-600" />
        
        {isEditingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setEditedTitle(module.title);
                  setIsEditingTitle(false);
                }
              }}
              className="flex-1"
              autoFocus
            />
            <button onClick={handleSaveTitle} className="p-2 text-green-600 hover:bg-green-50 rounded">
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditedTitle(module.title);
                setIsEditingTitle(false);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{module.title}</h4>
            <span className="text-xs text-gray-500">
              ({module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'})
            </span>
          </div>
        )}
        
        <button
          onClick={() => setIsEditingTitle(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onRemove(module.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Module Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-3">
              {/* Lessons List */}
              {module.lessons.map((lesson, idx) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  index={idx}
                  onUpdate={(updates) => onUpdateLesson(module.id, lesson.id, updates)}
                  onRemove={() => onRemoveLesson(module.id, lesson.id)}
                />
              ))}
              
              {/* Add Lesson Button */}
              <button
                onClick={() => onAddLesson(module.id)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Lesson
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Lesson Item Component
const LessonItem: React.FC<{
  lesson: CourseLesson;
  index: number;
  onUpdate: (updates: Partial<CourseLesson>) => void;
  onRemove: () => void;
}> = ({ lesson, index, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(lesson.title);
  const [editedType, setEditedType] = useState<LessonType>(lesson.type);
  const [editedDuration, setEditedDuration] = useState(lesson.duration || '');
  const [editedVideoURL, setEditedVideoURL] = useState(lesson.videoURL || '');
  const [editedExternalURL, setEditedExternalURL] = useState(lesson.externalURL || '');
  
  const lessonTypeInfo = LESSON_TYPES.find(t => t.id === lesson.type);
  const Icon = lessonTypeInfo?.icon || FileText;
  
  const handleSave = () => {
    if (!editedTitle.trim()) return;
    
    onUpdate({
      title: editedTitle.trim(),
      type: editedType,
      duration: editedDuration || undefined,
      videoURL: editedType === 'video' ? editedVideoURL : undefined,
      externalURL: editedType === 'external-link' ? editedExternalURL : undefined,
    });
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white/50 rounded-lg p-3">
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Lesson Title</Label>
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Lesson title"
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Lesson Type</Label>
              <Select value={editedType} onValueChange={(v) => setEditedType(v as LessonType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LESSON_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Duration (optional)</Label>
              <Input
                value={editedDuration}
                onChange={(e) => setEditedDuration(e.target.value)}
                placeholder="e.g., 10:30"
                className="mt-1"
              />
            </div>
          </div>
          
          {editedType === 'video' && (
            <div>
              <Label className="text-xs">Video URL (YouTube or direct link)</Label>
              <Input
                value={editedVideoURL}
                onChange={(e) => setEditedVideoURL(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-1"
              />
            </div>
          )}
          
          {editedType === 'external-link' && (
            <div>
              <Label className="text-xs">External Link</Label>
              <Input
                value={editedExternalURL}
                onChange={(e) => setEditedExternalURL(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="flex-1">
              Save
            </Button>
            <Button
              onClick={() => {
                setEditedTitle(lesson.title);
                setEditedType(lesson.type);
                setIsEditing(false);
              }}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 w-6">{index + 1}.</span>
          <Icon className="w-4 h-4 text-gray-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
            <p className="text-xs text-gray-500">
              {lessonTypeInfo?.name}
              {lesson.duration && ` • ${lesson.duration}`}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export const StepCourseCurriculum: React.FC = () => {
  const store = useCourseCreateStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleAddModule = () => {
    const newModule: CourseModule = {
      id: `module_${Date.now()}`,
      title: `Module ${store.modules.length + 1}`,
      order: store.modules.length,
      lessons: [],
    };
    store.addModule(newModule);
  };
  
  const handleAddLesson = (moduleId: string) => {
    const newLesson: CourseLesson = {
      id: `lesson_${Date.now()}`,
      title: 'New Lesson',
      type: 'video',
      order: store.modules.find(m => m.id === moduleId)?.lessons.length || 0,
    };
    store.addLesson(moduleId, newLesson);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = store.modules.findIndex(m => m.id === active.id);
    const newIndex = store.modules.findIndex(m => m.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      store.reorderModules(oldIndex, newIndex);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Build Your Curriculum</h3>
            <p className="text-sm text-gray-600 mt-1">
              Organize your course into modules and lessons. Drag to reorder.
            </p>
          </div>
          <Button
            onClick={handleAddModule}
            className="bg-gradient-to-r from-indigo-600 to-violet-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>
      
      {/* Modules List */}
      {store.modules.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={store.modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {store.modules.map(module => (
                <SortableModule
                  key={module.id}
                  module={module}
                  onUpdate={store.updateModule}
                  onRemove={store.removeModule}
                  onAddLesson={handleAddLesson}
                  onUpdateLesson={store.updateLesson}
                  onRemoveLesson={store.removeLesson}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h4>
          <p className="text-sm text-gray-600 mb-6">
            Start building your course by adding your first module
          </p>
          <Button
            onClick={handleAddModule}
            className="bg-gradient-to-r from-indigo-600 to-violet-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Module
          </Button>
        </div>
      )}
      
      {/* Summary */}
      {store.modules.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Course Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600">{store.modules.length}</div>
              <div className="text-sm text-gray-600">Modules</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-violet-600">
                {store.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Lessons</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {store.modules.filter(m => m.lessons.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">Complete Modules</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

