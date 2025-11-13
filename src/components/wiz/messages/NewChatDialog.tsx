import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, BookOpen, Handshake, MessageCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { messageService } from '@/lib/message-service';
import { toast } from 'sonner';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated?: (chatId: string) => void;
}

interface UserOption {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  online?: boolean;
}

interface CommunityOption {
  id: string;
  name: string;
  avatar?: string;
  memberCount?: number;
}

export const NewChatDialog = ({ open, onOpenChange, onChatCreated }: NewChatDialogProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'communities' | 'courses'>('users');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Data states
  const [users, setUsers] = useState<UserOption[]>([]);
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [courses, setCourses] = useState<CommunityOption[]>([]);

  // Load users from Firestore
  useEffect(() => {
    if (!open || !user) return;

    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('uid', '!=', user.uid), // Exclude current user
          limit(50)
        );
        const snapshot = await getDocs(q);

        const usersList: UserOption[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().displayName || doc.data().email || 'Unknown User',
          username: doc.data().username,
          avatar: doc.data().photoURL,
          online: false, // Could add online status later
        }));

        setUsers(usersList);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [open, user?.uid]);

  // Load communities
  useEffect(() => {
    if (!open || !user || activeTab !== 'communities') return;

    const loadCommunities = async () => {
      setIsLoading(true);
      try {
        const communitiesRef = collection(db, 'communities');
        const q = query(
          communitiesRef,
          where('members', 'array-contains', user.uid),
          where('status', '==', 'published'),
          limit(50)
        );
        const snapshot = await getDocs(q);

        const communitiesList: CommunityOption[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.data().title || 'Unnamed Community',
          avatar: doc.data().banner || doc.data().avatar,
          memberCount: doc.data().members?.length || 0,
        }));

        setCommunities(communitiesList);
      } catch (error) {
        console.error('Error loading communities:', error);
        toast.error('Failed to load communities');
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunities();
  }, [open, user?.uid, activeTab]);

  // Load courses
  useEffect(() => {
    if (!open || !user || activeTab !== 'courses') return;

    const loadCourses = async () => {
      setIsLoading(true);
      try {
        // Load from both community and claim courses
        const communityCoursesRef = collection(db, 'courses_community');
        const claimCoursesRef = collection(db, 'courses_claim');

        const [communitySnapshot, claimSnapshot] = await Promise.all([
          getDocs(query(communityCoursesRef, where('status', '==', 'published'), limit(25))),
          getDocs(query(claimCoursesRef, where('status', '==', 'published'), limit(25))),
        ]);

        const coursesList: CommunityOption[] = [
          ...communitySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().title || 'Unnamed Course',
            avatar: doc.data().thumbnail,
            memberCount: doc.data().enrolledCount || 0,
          })),
          ...claimSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().title || 'Unnamed Course',
            avatar: doc.data().thumbnail,
            memberCount: doc.data().enrolledCount || 0,
          })),
        ];

        setCourses(coursesList);
      } catch (error) {
        console.error('Error loading courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [open, user?.uid, activeTab]);

  // Handle creating a new DM chat
  const handleCreateDM = async (recipientId: string, recipientName: string) => {
    if (!user) return;

    setIsCreating(true);
    try {
      // Check if chat already exists
      const existingChatId = await messageService.findOrCreateDM(user.uid, recipientId);

      toast.success(`Chat with ${recipientName} opened!`);
      onChatCreated?.(existingChatId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating DM:', error);
      toast.error('Failed to create chat');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle creating a community chat
  const handleCreateCommunityChat = async (communityId: string, communityName: string) => {
    if (!user) return;

    setIsCreating(true);
    try {
      const chatId = await messageService.findOrCreateCommunityChat(communityId, user.uid);

      toast.success(`Community chat "${communityName}" opened!`);
      onChatCreated?.(chatId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating community chat:', error);
      toast.error('Failed to open community chat');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle creating a course chat
  const handleCreateCourseChat = async (courseId: string, courseName: string) => {
    if (!user) return;

    setIsCreating(true);
    try {
      const chatId = await messageService.findOrCreateCourseChat(courseId, user.uid);

      toast.success(`Course chat "${courseName}" opened!`);
      onChatCreated?.(chatId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating course chat:', error);
      toast.error('Failed to open course chat');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter based on search
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Start New Chat
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users, communities, or courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
          <TabsList className="w-full justify-start border-b rounded-none px-6 bg-transparent">
            <TabsTrigger value="users" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              Direct Messages
            </TabsTrigger>
            <TabsTrigger value="communities" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
          </TabsList>

          {/* Users List */}
          <TabsContent value="users" className="mt-0 h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/50">
                {filteredUsers.map((user, index) => (
                  <motion.button
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleCreateDM(user.id, user.name)}
                    disabled={isCreating}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-purple-50/50 transition-colors disabled:opacity-50"
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {user.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      {user.username && (
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Communities List */}
          <TabsContent value="communities" className="mt-0 h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : filteredCommunities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Users className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600">No communities found</p>
                <p className="text-sm text-gray-500 mt-2">Join a community to start chatting!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/50">
                {filteredCommunities.map((community, index) => (
                  <motion.button
                    key={community.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleCreateCommunityChat(community.id, community.name)}
                    disabled={isCreating}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-purple-50/50 transition-colors disabled:opacity-50"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={community.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {community.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">{community.name}</h3>
                      <p className="text-sm text-gray-500">{community.memberCount} members</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Community</Badge>
                  </motion.button>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Courses List */}
          <TabsContent value="courses" className="mt-0 h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600">No courses found</p>
                <p className="text-sm text-gray-500 mt-2">Enroll in a course to join discussions!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/50">
                {filteredCourses.map((course, index) => (
                  <motion.button
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleCreateCourseChat(course.id, course.name)}
                    disabled={isCreating}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-purple-50/50 transition-colors disabled:opacity-50"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={course.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {course.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-500">{course.memberCount} enrolled</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Course</Badge>
                  </motion.button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
