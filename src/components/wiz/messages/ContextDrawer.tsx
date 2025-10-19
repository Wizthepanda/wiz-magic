import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Users,
  BookOpen,
  Image,
  File,
  Link as LinkIcon,
  ExternalLink,
  Bell,
  BellOff,
  UserMinus,
  Flag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/pages/MessagesPage';

interface ContextDrawerProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

interface SharedMedia {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  thumbnailUrl?: string;
  name: string;
  timestamp: string;
}

interface LinkedContent {
  id: string;
  type: 'course' | 'community' | 'creation';
  name: string;
  thumbnailUrl: string;
  stats?: {
    members?: number;
    students?: number;
    views?: number;
  };
}

// Mock data
const mockSharedMedia: SharedMedia[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200',
    name: 'React Component Diagram',
    timestamp: '2 days ago',
  },
  {
    id: '2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
    thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=200',
    name: 'UI Mockup',
    timestamp: '5 days ago',
  },
  {
    id: '3',
    type: 'file',
    url: '#',
    name: 'project-requirements.pdf',
    timestamp: '1 week ago',
  },
];

const mockLinkedContent: LinkedContent[] = [
  {
    id: '1',
    type: 'course',
    name: 'React Mastery',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    stats: { students: 1234 },
  },
  {
    id: '2',
    type: 'community',
    name: 'Web Dev Masters',
    thumbnailUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=WebDev',
    stats: { members: 5678 },
  },
];

export const ContextDrawer = ({
  conversation,
  isOpen,
  onClose,
  isMobile,
}: ContextDrawerProps) => {
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const visibleMedia = showAllMedia ? mockSharedMedia : mockSharedMedia.slice(0, 6);

  return (
    <motion.div
      initial={isMobile ? { x: '100%' } : { x: 320, opacity: 0 }}
      animate={isMobile ? { x: 0 } : { x: 0, opacity: 1 }}
      exit={isMobile ? { x: '100%' } : { x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "h-full bg-white/60 backdrop-blur-xl overflow-y-auto scrollbar-hide",
        isMobile && "absolute inset-0 z-50"
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Conversation Info</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/50">
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback className="text-2xl">{conversation.name[0]}</AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {conversation.name}
          </h2>

          {conversation.online && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Active now</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="capitalize">
              {conversation.type}
            </Badge>
            {conversation.type === 'community' && (
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                1.2k members
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="flex flex-col h-auto py-3 gap-2"
          >
            {isMuted ? (
              <BellOff className="w-5 h-5 text-gray-600" />
            ) : (
              <Bell className="w-5 h-5 text-gray-600" />
            )}
            <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-3 gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Flag className="w-5 h-5" />
            <span className="text-xs">Report</span>
          </Button>
        </div>

        <Separator />

        {/* Shared Media */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Shared Media
            </h4>
            <span className="text-xs text-gray-500">
              {mockSharedMedia.length} items
            </span>
          </div>

          {mockSharedMedia.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {visibleMedia.map((media, index) => (
                  <motion.div
                    key={media.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.thumbnailUrl}
                        alt={media.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <File className="w-8 h-8 text-purple-600" />
                    )}
                  </motion.div>
                ))}
              </div>

              {mockSharedMedia.length > 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllMedia(!showAllMedia)}
                  className="w-full mt-3 text-purple-600"
                >
                  {showAllMedia ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show All ({mockSharedMedia.length - 6} more)
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No media shared yet
            </div>
          )}
        </div>

        <Separator />

        {/* Linked Content */}
        {conversation.type !== 'dm' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Linked Content
                </h4>
              </div>

              <div className="space-y-3">
                {mockLinkedContent.map((content, index) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 cursor-pointer hover:shadow-md transition-all"
                  >
                    <img
                      src={content.thumbnailUrl}
                      alt={content.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-gray-900 truncate">
                        {content.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {content.type}
                        </Badge>
                        {content.stats && (
                          <span className="text-xs text-gray-500">
                            {content.stats.members && `${content.stats.members.toLocaleString()} members`}
                            {content.stats.students && `${content.stats.students.toLocaleString()} students`}
                            {content.stats.views && `${content.stats.views.toLocaleString()} views`}
                          </span>
                        )}
                      </div>
                    </div>

                    <ExternalLink className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Community/Group Info */}
        {conversation.type === 'community' && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community Summary
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Members</span>
                <span className="font-semibold text-gray-900">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Today</span>
                <span className="font-semibold text-green-600">328</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-semibold text-gray-900">3 months ago</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              View Community
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {conversation.type === 'course' && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Course Info
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Students</span>
                <span className="font-semibold text-gray-900">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Lessons</span>
                <span className="font-semibold text-gray-900">42</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Instructor</span>
                <span className="font-semibold text-gray-900">Alex Johnson</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              View Course
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Danger Zone */}
        {conversation.type === 'dm' && (
          <>
            <Separator />
            <div>
              <Button
                variant="ghost"
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Block User
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
