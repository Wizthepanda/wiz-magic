import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Image as ImageIcon, Video, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface PostComposerProps {
  onPost: (content: string, embedUrl?: string, attachments?: File[]) => void;
  userAvatar?: string;
  userName?: string;
  placeholder?: string;
  className?: string;
}

/**
 * PostComposer Component
 * - Rich text input with emoji picker
 * - Video URL embed detection (YouTube, Vimeo, TikTok)
 * - Image/video attachment support
 * - Auto-expand textarea
 * - Smooth animations
 */
export const PostComposer: React.FC<PostComposerProps> = ({
  onPost,
  userAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  userName = 'You',
  placeholder = "What's on your mind?",
  className,
}) => {
  const [content, setContent] = useState('');
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect video URLs (YouTube, Vimeo, TikTok)
  const detectVideoUrl = (text: string): string | null => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
    const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/;

    const youtubeMatch = text.match(youtubeRegex);
    const vimeoMatch = text.match(vimeoRegex);
    const tiktokMatch = text.match(tiktokRegex);

    if (youtubeMatch) return `https://www.youtube.com/watch?v=${youtubeMatch[1]}`;
    if (vimeoMatch) return `https://vimeo.com/${vimeoMatch[1]}`;
    if (tiktokMatch) return text.match(tiktokRegex)?.[0] || null;

    return null;
  };

  // Handle content change and detect embed URLs
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Auto-detect video URLs
    const detectedUrl = detectVideoUrl(newContent);
    if (detectedUrl) {
      setEmbedUrl(detectedUrl);
    } else if (!newContent.includes('http')) {
      setEmbedUrl(null);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: any) => {
    const newContent = content + emoji.native;
    setContent(newContent);
    setShowEmojiPicker(false);

    // Focus back on textarea
    textareaRef.current?.focus();
  };

  // Handle file attachments
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files].slice(0, 4)); // Max 4 attachments
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle post submission
  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;

    setIsPosting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    onPost(content, embedUrl || undefined, attachments);

    // Reset form
    setContent('');
    setEmbedUrl(null);
    setAttachments([]);
    setIsPosting(false);
  };

  const canPost = content.trim().length > 0 || attachments.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white/60 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-lg border border-white/20 overflow-visible',
        className
      )}
    >
      <div className="flex items-start gap-3 overflow-visible">
        {/* User Avatar */}
        <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-xl ring-2 ring-white shadow-md">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-400 to-indigo-400 text-white font-bold">
            {userName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Input Area */}
        <div className="flex-1 overflow-visible">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            className="min-h-[80px] resize-none border-0 focus-visible:ring-2 focus-visible:ring-purple-500 bg-gray-50/50 rounded-xl p-3"
            disabled={isPosting}
          />

          {/* Embed Preview */}
          <AnimatePresence>
            {embedUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-200"
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Video embed detected</span>
                  <button
                    onClick={() => setEmbedUrl(null)}
                    className="ml-auto p-1 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">{embedUrl}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attachments Preview */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2"
              >
                {attachments.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 overflow-visible">
            <div className="flex items-center gap-2 overflow-visible">
              {/* Emoji Picker */}
              <div className="relative overflow-visible">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="hover:bg-purple-100 hover:text-purple-700"
                  disabled={isPosting}
                >
                  <Smile className="w-4 h-4" />
                </Button>

                <AnimatePresence>
                  {showEmojiPicker && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setShowEmojiPicker(false)}
                      />
                      {/* Emoji Picker */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute left-0 top-full mt-2 z-[9999] shadow-2xl rounded-xl overflow-hidden"
                      >
                        <Picker
                          data={data}
                          onEmojiSelect={handleEmojiSelect}
                          theme="light"
                          previewPosition="none"
                          skinTonePosition="search"
                        />
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Image/Video Upload */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="hover:bg-indigo-100 hover:text-indigo-700"
                disabled={isPosting || attachments.length >= 4}
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Attachment Count */}
              {attachments.length > 0 && (
                <span className="text-xs text-gray-500">
                  {attachments.length}/4
                </span>
              )}
            </div>

            {/* Post Button */}
            <Button
              onClick={handleSubmit}
              disabled={!canPost || isPosting}
              className={cn(
                'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all',
                canPost && !isPosting && 'shadow-purple-500/30 hover:scale-105'
              )}
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
