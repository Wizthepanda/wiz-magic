import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Settings,
  ChevronLeft,
  MessageCircle,
  FileText,
  Eye,
  Send,
  ThumbsUp,
  Reply,
  BookOpen,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useXp } from '@/context/XpContext';

interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  lessons: Array<{
    id: string;
    title: string;
    duration: string;
    videoUrl?: string;
  }>;
  description?: string;
}

interface WizLessonViewerProps {
  course: Course;
  currentLesson: number;
  lessonProgress: number;
  onClose: () => void;
  onCompleteLesson: () => void;
  onNextLesson: () => void;
  onPrevLesson: () => void;
}

const mockTranscript = [
  { timestamp: "00:00", text: "Welcome to this lesson on artificial intelligence fundamentals." },
  { timestamp: "00:15", text: "Today we'll cover the basic concepts that form the foundation of AI." },
  { timestamp: "00:30", text: "We'll start with machine learning and its relationship to AI." },
  { timestamp: "01:00", text: "Machine learning is a subset of artificial intelligence..." },
  { timestamp: "01:30", text: "There are three main types of machine learning approaches." },
  { timestamp: "02:00", text: "Supervised learning uses labeled data to train models." },
  { timestamp: "02:30", text: "Unsupervised learning finds patterns in unlabeled data." },
  { timestamp: "03:00", text: "Reinforcement learning learns through trial and error." }
];

const mockDiscussion = [
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "/Profile Pics/FERA.jpg",
    timestamp: "2 hours ago",
    content: "Great explanation of supervised learning! Could you provide more examples of real-world applications?",
    likes: 12,
    replies: [
      {
        id: 11,
        user: "Dr. Sarah Chen",
        avatar: "/Profile Pics/Fera.jpg",
        timestamp: "1 hour ago",
        content: "Absolutely! Some common examples include email spam detection, image recognition, and recommendation systems like those used by Netflix and Spotify.",
        likes: 8,
        isInstructor: true
      }
    ]
  },
  {
    id: 2,
    user: "Mike Rodriguez",
    avatar: "/Profile Pics/Bogdan.jpg",
    timestamp: "4 hours ago",
    content: "I'm having trouble understanding the difference between supervised and unsupervised learning. Any tips?",
    likes: 5,
    replies: []
  }
];

export const WizLessonViewer: React.FC<WizLessonViewerProps> = ({
  course,
  currentLesson,
  lessonProgress,
  onClose,
  onCompleteLesson,
  onNextLesson,
  onPrevLesson
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300); // 5 minutes mock duration
  const [volume, setVolume] = useState(1);
  const [activeTab, setActiveTab] = useState('transcript');
  const [userNotes, setUserNotes] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const { addXP } = useXp();

  const currentLessonData = course.curriculum[currentLesson];
  const progress = (currentTime / duration) * 100;

  useEffect(() => {
    // Simulate video progress
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= duration * 0.9 && !isCompleted) {
            // Mark lesson as completed when 90% watched
            setIsCompleted(true);
            onCompleteLesson();
            addXP(50, `Completed: ${currentLessonData.title}`);
          }
          return Math.min(newTime, duration);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, isCompleted, onCompleteLesson, currentLessonData.title, addXP]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Add comment logic here
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  const handleSaveNotes = () => {
    // Save notes logic here
    console.log('Saving notes:', userNotes);
    addXP(10, 'Taking Notes');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Course
          </Button>
          <div className="hidden md:block">
            <h1 className="font-semibold">{course.title}</h1>
            <p className="text-sm text-gray-300">{currentLessonData.title}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">
            {currentLesson + 1} of {course.curriculum.length}
          </span>
          <Progress value={lessonProgress} className="w-20" />
        </div>
      </div>

      <div className={cn(
        "flex-1 flex",
        isMobile ? "flex-col" : "flex-row"
      )}>
        {/* Video Player */}
        <div className={cn(
          "bg-black flex flex-col",
          isMobile ? "flex-1" : "flex-1 max-w-4xl"
        )}>
          {/* Video Container */}
          <div className="flex-1 relative flex items-center justify-center bg-gray-900">
            <div className="w-full h-full flex items-center justify-center">
              {/* Mock Video Player */}
              <div className="relative w-full h-full max-w-4xl max-h-[60vh] bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🎓</div>
                  <h3 className="text-xl font-semibold mb-2">{currentLessonData.title}</h3>
                  <p className="text-gray-300 mb-4">Duration: {currentLessonData.duration}</p>
                </div>

                {/* Play/Pause Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    onClick={togglePlay}
                    className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/50"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </Button>
                </div>

                {/* Progress Overlay */}
                {progress > 0 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-white text-sm mb-2">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <Progress value={progress} className="w-full h-2" />
                    </div>
                  </div>
                )}

                {/* Completion Badge */}
                <AnimatePresence>
                  {isCompleted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-4 right-4"
                    >
                      <Badge className="bg-green-500 text-white border-0 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Completed</span>
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Video Controls */}
          <div className="p-4 bg-gray-800 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => currentLesson > 0 && onPrevLesson()}
                  disabled={currentLesson === 0}
                  className="text-white hover:bg-gray-700"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-gray-700"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => currentLesson < course.curriculum.length - 1 && onNextLesson()}
                  disabled={currentLesson === course.curriculum.length - 1}
                  className="text-white hover:bg-gray-700"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
                {isCompleted && currentLesson < course.curriculum.length - 1 && (
                  <Button
                    onClick={onNextLesson}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Next Lesson
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={cn(
          "bg-white border-l border-gray-200",
          isMobile ? "h-96" : "w-96 h-full"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transcript" className="flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Transcript</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center space-x-1">
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Discussion</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="transcript" className="h-full m-0 p-0">
                <div className="h-full overflow-y-auto p-4 space-y-3">
                  {mockTranscript.map((item, index) => (
                    <div
                      key={index}
                      className="flex space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSeek(parseInt(item.timestamp.split(':')[0]) * 60 + parseInt(item.timestamp.split(':')[1]))}
                    >
                      <Badge variant="outline" className="text-xs shrink-0">
                        {item.timestamp}
                      </Badge>
                      <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="h-full m-0 p-0">
                <div className="h-full flex flex-col p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Personal Notes</h3>
                    <Button size="sm" onClick={handleSaveNotes}>
                      Save Notes
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Take notes about this lesson..."
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="flex-1 resize-none"
                  />
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Notes are private</span>
                    </div>
                    <p className="text-xs text-blue-500 mt-1">
                      Your notes are saved to your profile and only visible to you.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="discussion" className="h-full m-0 p-0">
                <div className="h-full flex flex-col">
                  {/* Comments List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {mockDiscussion.map((comment) => (
                      <div key={comment.id} className="space-y-3">
                        <div className="flex space-x-3">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.user[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium text-gray-800">{comment.user}</p>
                              {comment.isInstructor && (
                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                  Instructor
                                </Badge>
                              )}
                              <p className="text-xs text-gray-500">{comment.timestamp}</p>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed mb-2">{comment.content}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <Button variant="ghost" size="sm" className="p-0 h-auto">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {comment.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="p-0 h-auto">
                                <Reply className="w-3 h-3 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Replies */}
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="ml-11 flex space-x-3">
                            <Avatar className="w-6 h-6 shrink-0">
                              <AvatarImage src={reply.avatar} />
                              <AvatarFallback className="text-xs">{reply.user[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-sm font-medium text-gray-800">{reply.user}</p>
                                {reply.isInstructor && (
                                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                    Instructor
                                  </Badge>
                                )}
                                <p className="text-xs text-gray-500">{reply.timestamp}</p>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed mb-2">{reply.content}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <Button variant="ghost" size="sm" className="p-0 h-auto">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {reply.likes}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Ask a question or share your thoughts..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[60px] resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            Be respectful and helpful to fellow students
                          </p>
                          <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                            <Send className="w-3 h-3 mr-1" />
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WizLessonViewer;