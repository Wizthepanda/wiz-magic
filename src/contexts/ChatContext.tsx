import { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatPopup {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  verified?: boolean;
}

interface ChatContextType {
  chats: ChatPopup[];
  minimized: string[];
  openChat: (chat: ChatPopup) => void;
  closeChat: (id: string) => void;
  toggleMinimize: (id: string) => void;
  clearAllChats: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<ChatPopup[]>([]);
  const [minimized, setMinimized] = useState<string[]>([]);

  const openChat = (chat: ChatPopup) => {
    // Check if chat already exists
    const exists = chats.find(c => c.id === chat.id);
    if (!exists) {
      // Limit to 3 open chats max
      if (chats.length >= 3) {
        // Remove the oldest chat (first in array)
        setChats(prev => [...prev.slice(1), chat]);
      } else {
        setChats(prev => [...prev, chat]);
      }
    }
    // Unminimize if it was minimized
    setMinimized(prev => prev.filter(id => id !== chat.id));
  };

  const closeChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    setMinimized(prev => prev.filter(mid => mid !== id));
  };

  const toggleMinimize = (id: string) => {
    setMinimized(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const clearAllChats = () => {
    setChats([]);
    setMinimized([]);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        minimized,
        openChat,
        closeChat,
        toggleMinimize,
        clearAllChats
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
