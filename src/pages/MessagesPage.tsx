import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConversationList } from '@/components/wiz/messages/ConversationList';
import { ChatWindow } from '@/components/wiz/messages/ChatWindow';
import { ContextDrawer } from '@/components/wiz/messages/ContextDrawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface Conversation {
  id: string;
  type: 'dm' | 'community' | 'course' | 'collab';
  avatar: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online?: boolean;
  communityId?: string;
  courseId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'course-link' | 'creation-link';
  metadata?: {
    fileName?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    courseId?: string;
    courseName?: string;
    creationId?: string;
    creationName?: string;
  };
}

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const isMobile = useIsMobile();

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  // Handle back to conversations (mobile)
  const handleBackToConversations = () => {
    setShowConversationList(true);
    setSelectedConversation(null);
  };

  // Toggle context drawer
  const toggleContextDrawer = () => {
    setIsContextDrawerOpen(!isContextDrawerOpen);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-white via-[#f7f9fc] to-[#eef1f7]">
      {/* Page Shimmer Loader */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 pointer-events-none z-50"
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile View */}
        {isMobile ? (
          <AnimatePresence mode="wait">
            {showConversationList ? (
              <motion.div
                key="conversation-list-mobile"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <ConversationList
                  onSelectConversation={handleSelectConversation}
                  selectedConversation={selectedConversation}
                />
              </motion.div>
            ) : (
              <motion.div
                key="chat-window-mobile"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex"
              >
                <ChatWindow
                  conversation={selectedConversation}
                  onBack={handleBackToConversations}
                  onToggleInfo={toggleContextDrawer}
                  isMobile={true}
                />

                {/* Mobile Context Drawer (Slide over) */}
                <AnimatePresence>
                  {isContextDrawerOpen && selectedConversation && (
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="absolute inset-0 z-50"
                    >
                      <ContextDrawer
                        conversation={selectedConversation}
                        isOpen={isContextDrawerOpen}
                        onClose={toggleContextDrawer}
                        isMobile={true}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          /* Desktop View - 3 Panel Layout */
          <>
            {/* Left Panel - Conversation List */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "border-r border-gray-200/50",
                isContextDrawerOpen ? "w-80" : "w-96"
              )}
            >
              <ConversationList
                onSelectConversation={handleSelectConversation}
                selectedConversation={selectedConversation}
              />
            </motion.div>

            {/* Middle Panel - Chat Window */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex-1 flex"
            >
              <ChatWindow
                conversation={selectedConversation}
                onToggleInfo={toggleContextDrawer}
                isMobile={false}
              />
            </motion.div>

            {/* Right Panel - Context Drawer (Collapsible) */}
            <AnimatePresence>
              {isContextDrawerOpen && selectedConversation && (
                <motion.div
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="w-80 border-l border-gray-200/50"
                >
                  <ContextDrawer
                    conversation={selectedConversation}
                    isOpen={isContextDrawerOpen}
                    onClose={toggleContextDrawer}
                    isMobile={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
