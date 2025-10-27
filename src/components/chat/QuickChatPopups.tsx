/**
 * Quick Chat Popups - Messenger-Style Chat Boxes
 * Bottom-right corner floating chat windows
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/ChatContext";
import { useState } from "react";

export default function QuickChatPopups() {
  const { chats, minimized, closeChat, toggleMinimize } = useChat();
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleSendMessage = (chatId: string) => {
    const message = inputValues[chatId];
    if (!message?.trim()) return;

    // Add message to local state (in a real app, this would send to backend)
    setMessages(prev => ({
      ...prev,
      [chatId]: message
    }));

    // Clear input
    setInputValues(prev => ({
      ...prev,
      [chatId]: ''
    }));

    // TODO: Send message via API
    console.log('Sending message:', { chatId, message });
  };

  return (
    <div className="fixed bottom-4 right-4 flex gap-3 z-[1200] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {chats.map((chat, index) => {
          const isMinimized = minimized.includes(chat.id);

          return (
            <motion.div
              key={chat.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{
                duration: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={cn(
                "rounded-2xl overflow-hidden pointer-events-auto flex flex-col",
                "bg-[#1E202E]/95 backdrop-blur-xl saturate-150",
                "border border-white/15",
                "shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]",
                isMinimized ? "w-64 h-auto" : "w-80 h-96"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-white font-medium truncate">
                        {chat.name}
                      </p>
                      {chat.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-green-400">Active now</p>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => toggleMinimize(chat.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    aria-label={isMinimized ? "Expand" : "Minimize"}
                  >
                    <Minus className="w-4 h-4 text-white/70 hover:text-white" />
                  </button>
                  <button
                    onClick={() => closeChat(chat.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4 text-white/70 hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Chat Body - Only show when not minimized */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {/* Last message from dropdown */}
                      {chat.lastMessage && (
                        <div className="flex justify-start">
                          <div className="max-w-[75%] bg-white/10 text-white/80 text-xs p-3 rounded-2xl rounded-tl-sm">
                            {chat.lastMessage}
                          </div>
                        </div>
                      )}

                      {/* Sent message (if any) */}
                      {messages[chat.id] && (
                        <div className="flex justify-end">
                          <div className="max-w-[75%] bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs p-3 rounded-2xl rounded-tr-sm">
                            {messages[chat.id]}
                          </div>
                        </div>
                      )}

                      {/* Empty state */}
                      {!chat.lastMessage && !messages[chat.id] && (
                        <div className="text-center py-8">
                          <p className="text-xs text-white/40">
                            Start a conversation with {chat.name}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-white/10 bg-white/5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={inputValues[chat.id] || ''}
                          onChange={(e) => setInputValues(prev => ({
                            ...prev,
                            [chat.id]: e.target.value
                          }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(chat.id);
                            }
                          }}
                          className="flex-1 bg-white/10 text-white/90 text-xs px-3 py-2 rounded-xl outline-none placeholder:text-white/40 focus:ring-2 focus:ring-indigo-400/50 transition-all"
                        />
                        <button
                          onClick={() => handleSendMessage(chat.id)}
                          disabled={!inputValues[chat.id]?.trim()}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            inputValues[chat.id]?.trim()
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
                              : "bg-white/10 opacity-50 cursor-not-allowed"
                          )}
                          aria-label="Send message"
                        >
                          <Send className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
