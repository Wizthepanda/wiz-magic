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
  X,
  Check,
  CheckCheck,
} from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMessages } from '@/hooks/useMessages';
import type { Conversation, Message } from '@/pages/MessagesPage';

interface ChatWindowProps {
  conversation: Conversation | null;
  onBack?: () => void;
  onToggleInfo: () => void;
  isMobile: boolean;
}

export const ChatWindow = ({
  conversation,
  onBack,
  onToggleInfo,
  isMobile,
}: ChatWindowProps) => {
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filePreview, setFilePreview] = useState<{
    file: File;
    url: string;
    type: 'image' | 'file';
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Use messaging hook
  const {
    messages,
    isTyping,
    typingUserName,
    isSending,
    sendMessage,
    sendFile,
    setTypingStatus,
    markAsRead,
    addReaction,
  } = useMessages(conversation?.id || null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (conversation) {
      markAsRead();
    }
  }, [conversation, markAsRead]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !filePreview) return;

    // Send file if present
    if (filePreview) {
      await sendFile(filePreview.file, filePreview.type);
      setFilePreview(null);
    }

    // Send text message if present
    if (messageInput.trim()) {
      await sendMessage(messageInput.trim());
      setMessageInput('');
    }

    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    setTypingStatus();
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const fileType = file.type.startsWith('image/') ? 'image' : 'file';
    const url = URL.createObjectURL(file);

    setFilePreview({ file, url, type: fileType });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFilePreview = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview.url);
      setFilePreview(null);
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

                  {message.type === 'image' && message.metadata?.fileUrl && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="rounded-2xl overflow-hidden shadow-lg max-w-sm cursor-pointer"
                      onClick={() => window.open(message.metadata?.fileUrl, '_blank')}
                    >
                      <img
                        src={message.metadata.fileUrl}
                        alt={message.metadata.fileName || 'Image'}
                        className="w-full h-auto object-cover"
                      />
                    </motion.div>
                  )}

                  {message.type === 'file' && message.metadata && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 cursor-pointer max-w-sm"
                      onClick={() => window.open(message.metadata?.fileUrl, '_blank')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <File className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.metadata.fileName}
                          </p>
                          <p className="text-xs text-gray-500">Click to download</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      </div>
                    </motion.div>
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
        {/* File Preview */}
        <AnimatePresence>
          {filePreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 p-3 bg-white/90 rounded-xl border border-gray-200/50"
            >
              <div className="flex items-center gap-3">
                {filePreview.type === 'image' ? (
                  <img
                    src={filePreview.url}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                    <File className="w-8 h-8 text-purple-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {filePreview.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFilePreview}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-3">
          {/* Attach Button */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 text-gray-600 hover:text-purple-600"
            disabled={isSending}
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Input
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12 bg-white/80 border-gray-200/50 focus:border-purple-300 rounded-2xl resize-none"
              disabled={isSending}
            />

            {/* Emoji Button */}
            <div ref={emojiPickerRef} className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-600 hover:text-purple-600"
                disabled={isSending}
              >
                <Smile className="w-5 h-5" />
              </Button>

              {/* Emoji Picker Popup */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 z-50"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      autoFocusSearch={false}
                      width={320}
                      height={400}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={(!messageInput.trim() && !filePreview) || isSending}
            className={cn(
              "flex-shrink-0 rounded-xl transition-all duration-200",
              (messageInput.trim() || filePreview) && !isSending
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
