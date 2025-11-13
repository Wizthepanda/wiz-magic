import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip, Smile, Minimize2, Maximize2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: any;
  read: boolean;
}

interface MessagePopInProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onClose: () => void;
}

export const MessagePopIn: React.FC<MessagePopInProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
  onClose
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages in real-time
  useEffect(() => {
    if (!user || !recipientId) return;

    const messagesQuery = query(
      collection(db, 'direct_messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only include messages between user and recipient
        if (
          (data.senderId === user.uid && data.receiverId === recipientId) ||
          (data.senderId === recipientId && data.receiverId === user.uid)
        ) {
          loadedMessages.push({ id: doc.id, ...data } as Message);
        }
      });
      setMessages(loadedMessages);

      // Mark received messages as read
      loadedMessages.forEach((msg) => {
        if (msg.receiverId === user.uid && !msg.read) {
          updateDoc(doc(db, 'direct_messages', msg.id), { read: true });
        }
      });
    });

    return () => unsubscribe();
  }, [user?.uid, recipientId]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'direct_messages'), {
        senderId: user.uid,
        receiverId: recipientId,
        content: newMessage,
        participants: [user.uid, recipientId],
        createdAt: serverTimestamp(),
        read: false,
      });

      setNewMessage('');
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          "fixed bottom-6 right-6 w-96 bg-zinc-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50",
          isMinimized && "h-16"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 border-2 border-white/20">
              <AvatarImage src={recipientAvatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                {recipientName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{recipientName}</div>
              <div className="text-xs text-white/50">Active now</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              onClick={() => setIsMinimized(!isMinimized)}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg w-8 h-8 p-0"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Container */}
        {!isMinimized && (
          <>
            <div className="h-96 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                      <Send className="w-8 h-8 text-white/30" />
                    </div>
                    <p className="text-white/50 text-sm">No messages yet</p>
                    <p className="text-white/30 text-xs mt-1">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isSent = message.senderId === user?.uid;
                    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex gap-2",
                          isSent ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isSent && showAvatar && (
                          <Avatar className="w-8 h-8 border border-white/20 flex-shrink-0">
                            <AvatarImage src={recipientAvatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                              {recipientName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isSent && !showAvatar && <div className="w-8" />}

                        <div className={cn(
                          "max-w-[75%] space-y-1",
                          isSent && "items-end"
                        )}>
                          <div className={cn(
                            "px-4 py-2 rounded-2xl",
                            isSent
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                              : "bg-white/10 text-white rounded-bl-sm"
                          )}>
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                          <div className={cn(
                            "text-xs text-white/40 px-2",
                            isSent && "text-right"
                          )}>
                            {formatTime(message.createdAt)}
                          </div>
                        </div>

                        {isSent && showAvatar && (
                          <Avatar className="w-8 h-8 border border-white/20 flex-shrink-0">
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                              {user?.displayName?.[0]?.toUpperCase() || 'Y'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {isSent && !showAvatar && <div className="w-8" />}
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-zinc-900/50">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl resize-none text-sm focus:ring-2 focus:ring-purple-500/50 pr-20"
                    rows={1}
                  />

                  {/* Quick Actions */}
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg w-7 h-7 p-0"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg w-7 h-7 p-0"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                <span>Press Enter to send • Shift+Enter for new line</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
