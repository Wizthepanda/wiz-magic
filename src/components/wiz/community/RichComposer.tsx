import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Paperclip, Hash, Send, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichComposerProps {
  onSubmit: (content: string, attachments?: File[]) => Promise<void>;
  saving?: boolean;
  placeholder?: string;
  className?: string;
}

const EMOJI_SHORTCUTS = ["😊", "🎉", "👍", "❤️", "🔥", "💡", "🚀", "✨"];

export function RichComposer({
  onSubmit,
  saving = false,
  placeholder = "Share your thoughts, ask questions, or start a discussion...",
  className,
}: RichComposerProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!value.trim() && attachments.length === 0) return;

    await onSubmit(value, attachments);
    setValue("");
    setAttachments([]);
    setIsFocused(false);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + emoji + value.substring(end);

    setValue(newValue);

    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);

    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-4 transition-all duration-300",
        isFocused
          ? "bg-white/95 backdrop-blur-xl shadow-2xl border-2 border-indigo-200"
          : "bg-white/80 backdrop-blur-md shadow-lg border border-white/60",
        className
      )}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          if (!value.trim() && attachments.length === 0) {
            setIsFocused(false);
          }
        }}
        placeholder={placeholder}
        className={cn(
          "w-full resize-none border-0 focus:ring-0 text-sm bg-transparent placeholder:text-slate-400 transition-all duration-300",
          isFocused ? "min-h-[120px]" : "min-h-[60px]"
        )}
      />

      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative group"
              >
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs text-indigo-700 font-medium truncate max-w-[120px]">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="p-1 rounded-full hover:bg-indigo-100 transition-colors"
                  >
                    <X className="w-3 h-3 text-indigo-600" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50">
        <div className="flex items-center gap-2">
          {/* Emoji Picker */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showEmojiPicker
                  ? "bg-indigo-100 text-indigo-600"
                  : "hover:bg-slate-100 text-slate-600"
              )}
            >
              <Smile className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-10"
                >
                  <div className="grid grid-cols-4 gap-2">
                    {EMOJI_SHORTCUTS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => insertEmoji(emoji)}
                        className="w-10 h-10 flex items-center justify-center text-xl hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* File Attachment */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Hashtag */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setValue((v) => v + "#");
              textareaRef.current?.focus();
            }}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Hash className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Submit Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSubmit}
            disabled={saving || (!value.trim() && attachments.length === 0)}
            className={cn(
              "px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300",
              "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
              "hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            )}
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                <span className="ml-2">Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Character Count (optional) */}
      {isFocused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-slate-500 text-right"
        >
          {value.length} / 5000 characters
        </motion.div>
      )}
    </motion.div>
  );
}
