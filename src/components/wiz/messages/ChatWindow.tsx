import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Info,
  Phone,
  Video,
  Paperclip,
  Smile,
  Send,
  Link as LinkIcon,
  Image as ImageIcon,
  File,
  ExternalLink,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Conversation, Message } from '@/pages/MessagesPage';

interface ChatWindowProps {
  conversation: Conversation | null;
  onBack?: () => void;
  onToggleInfo: () => void;
  isMobile: boolean;
}

// Mock messages - replace with real data from Firebase/API
const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'other-user',
    senderName: 'Alex Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    content: 'Hey! I just finished watching your React course. It was amazing!',
    timestamp: '10:30 AM',
    type: 'text',
  },
  {
    id: '2',
    senderId: 'current-user',
    senderName: 'You',
    senderAvatar: '',
    content: 'Thank you so much! I\'m glad you found it helpful. Which part did you like the most?',
    timestamp: '10:32 AM',
    type: 'text',
  },
  {
    id: '3',
    senderId: 'other-user',
    senderName: 'Alex Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    content: 'The hooks section was incredibly clear. I also loved the real-world examples!',
    timestamp: '10:35 AM',
    type: 'text',
  },
  {
    id: '4',
    senderId: 'other-user',
    senderName: 'Alex Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    content: 'Speaking of which, check out this course I think you\'d like',
    timestamp: '10:36 AM',
    type: 'course-link',
    metadata: {
      courseId: 'advanced-react-123',
      courseName: 'Advanced React Patterns',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    },
  },
  {
    id: '5',
    senderId: 'current-user',
    senderName: 'You',
    senderAvatar: '',
    content: 'Wow, that looks great! Thanks for sharing.',
    timestamp: '10:38 AM',
    type: 'text',
  },
];

export const ChatWindow = ({
  conversation,
  onBack,
  onToggleInfo,
  isMobile,
}: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !conversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      senderAvatar: '',
      content: messageInput,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      type: 'text',
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    // TODO: Send to Firebase/API
    // TODO: Increment XP for sending message
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    // Empty state - no conversation selected
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-md"
        >
          <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-8">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 opacity-50"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Select a conversation
          </h2>
          <p className="text-gray-600">
            Choose a conversation from the list to start chatting with your community,
            students, or collaborators.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/40 backdrop-blur-xl">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200/50 bg-white/60 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback>{conversation.name[0]}</AvatarFallback>
            </Avatar>

            <div>
              <h2 className="font-semibold text-gray-900">{conversation.name}</h2>
              <div className="flex items-center gap-2">
                {conversation.online && (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-600">Active now</span>
                  </>
                )}
                {conversation.type !== 'dm' && (
                  <Badge variant="outline" className="text-xs capitalize ml-2">
                    {conversation.type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <LinkIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleInfo}>
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === 'current-user';
            const showAvatar = !isCurrentUser && (
              index === 0 ||
              messages[index - 1].senderId !== message.senderId
            );

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex gap-3",
                  isCurrentUser && "flex-row-reverse"
                )}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {showAvatar ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                      <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>

                {/* Message Content */}
                <div className={cn(
                  "flex flex-col max-w-[70%]",
                  isCurrentUser && "items-end"
                )}>
                  {message.type === 'text' && (
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl",
                        isCurrentUser
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm"
                          : "bg-white/80 backdrop-blur-sm text-gray-900 rounded-bl-sm shadow-sm"
                      )}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  )}

                  {message.type === 'course-link' && message.metadata && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-gray-200/50 cursor-pointer max-w-sm"
                    >
                      <img
                        src={message.metadata.thumbnailUrl}
                        alt={message.metadata.courseName}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {message.metadata.courseName}
                          </h4>
                          <ExternalLink className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">Course</Badge>
                      </div>
                    </motion.div>
                  )}

                  {/* Timestamp */}
                  <span className="text-xs text-gray-500 mt-1 px-1">
                    {message.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={conversation.avatar} alt={conversation.name} />
                <AvatarFallback>{conversation.name[0]}</AvatarFallback>
              </Avatar>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-gray-200/50 bg-white/60 backdrop-blur-xl">
        <div className="flex items-end gap-3">
          {/* Attach Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-gray-600 hover:text-purple-600"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12 bg-white/80 border-gray-200/50 focus:border-purple-300 rounded-2xl resize-none"
            />

            {/* Emoji Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-purple-600"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className={cn(
              "flex-shrink-0 rounded-xl transition-all duration-200",
              messageInput.trim()
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-[1.05]"
                : "bg-gray-200 text-gray-400"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
