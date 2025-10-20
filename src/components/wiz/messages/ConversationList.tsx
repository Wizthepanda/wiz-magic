import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, MessageCircle, Users, BookOpen, Handshake } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useConversations } from '@/hooks/useMessages';
import { NewChatDialog } from './NewChatDialog';
import type { Conversation } from '@/pages/MessagesPage';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversation: Conversation | null;
}

type FilterType = 'all' | 'unread' | 'communities' | 'courses' | 'collabs';

export const ConversationList = ({
  onSelectConversation,
  selectedConversation,
}: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);

  // Use real-time conversations hook
  const { conversations, isLoading, totalUnreadCount } = useConversations();

  // Handle chat created from dialog
  const handleChatCreated = async (chatId: string) => {
    // The conversation will appear in the list automatically via real-time updates
    // We can optionally select it immediately
    console.log('✅ New chat created:', chatId);

    // Find the newly created conversation and select it
    setTimeout(() => {
      const newConversation = conversations.find(c => c.id === chatId);
      if (newConversation) {
        onSelectConversation(newConversation);
      }
    }, 500); // Small delay to let Firestore update
  };

  // Filter conversations based on search and filter type
  const filteredConversations = conversations.filter((conv) => {
    // Search filter
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    let matchesFilter = true;
    if (activeFilter === 'unread') {
      matchesFilter = conv.unread > 0;
    } else if (activeFilter === 'communities') {
      matchesFilter = conv.type === 'community';
    } else if (activeFilter === 'courses') {
      matchesFilter = conv.type === 'course';
    } else if (activeFilter === 'collabs') {
      matchesFilter = conv.type === 'collab';
    }

    return matchesSearch && matchesFilter;
  });

  const filters = [
    { id: 'all', label: 'All', icon: MessageCircle },
    { id: 'unread', label: 'Unread', icon: Filter },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'collabs', label: 'Collabs', icon: Handshake },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-white/60 backdrop-blur-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            {totalUnreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {totalUnreadCount} unread message{totalUnreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setIsNewChatDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/80 border-gray-200/50 focus:border-purple-300 rounded-xl"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-6 py-4 border-b border-gray-200/50 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;

            return (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter.id as FilterType)}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                  "flex items-center gap-2",
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {filter.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          /* Loading State */
          <div className="h-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"
            />
          </div>
        ) : filteredConversations.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6"
            >
              <MessageCircle className="w-16 h-16 text-purple-600/50" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery || activeFilter !== 'all'
                ? 'No conversations found'
                : 'No messages yet'}
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-xs">
              {searchQuery || activeFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Start a conversation with your community!'}
            </p>
            <Button
              onClick={() => setIsNewChatDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Chat
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50">
            {filteredConversations.map((conversation, index) => (
              <motion.button
                key={conversation.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                onClick={() => onSelectConversation(conversation)}
                className={cn(
                  "w-full px-6 py-4 flex items-start gap-4 text-left transition-all duration-200",
                  selectedConversation?.id === conversation.id &&
                    "bg-purple-50/80 border-l-4 border-purple-600"
                )}
              >
                {/* Avatar with Online Indicator */}
                <div className="relative flex-shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.avatar} alt={conversation.name} />
                    <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {conversation.lastMessage}
                  </p>

                  {/* Type Badge & Unread Count */}
                  <div className="flex items-center gap-2">
                    {conversation.type !== 'dm' && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {conversation.type}
                      </Badge>
                    )}
                    {conversation.unread > 0 && (
                      <Badge
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse"
                      >
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA - New Chat (Desktop) */}
      <div className="p-4 border-t border-gray-200/50 hidden md:block">
        <Button
          variant="outline"
          onClick={() => setIsNewChatDialogOpen(true)}
          className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog
        open={isNewChatDialogOpen}
        onOpenChange={setIsNewChatDialogOpen}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};
