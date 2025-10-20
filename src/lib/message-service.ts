import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  Unsubscribe,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Message, Conversation } from '@/pages/MessagesPage';

// ====================================
// FIRESTORE DATA TYPES
// ====================================

export interface FirestoreMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Timestamp;
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
  emojis?: {
    emoji: string;
    userId: string;
    userName: string;
  }[];
  read: boolean;
  readBy?: {
    userId: string;
    readAt: Timestamp;
  }[];
}

export interface FirestoreChat {
  id: string;
  type: 'dm' | 'community' | 'course' | 'collab';
  participants: string[]; // user IDs
  participantDetails: {
    userId: string;
    userName: string;
    userAvatar: string;
    online?: boolean;
  }[];
  lastMessage: string;
  lastMessageAt: Timestamp;
  lastMessageSenderId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // DM specific
  dmPartnerId?: string;
  // Community/Course specific
  communityId?: string;
  courseId?: string;
  // Metadata
  name?: string;
  avatar?: string;
  unreadCount?: { [userId: string]: number };
}

export interface TypingStatus {
  userId: string;
  userName: string;
  chatId: string;
  timestamp: Timestamp;
}

// ====================================
// MESSAGE SERVICE CLASS
// ====================================

export class MessageService {
  private static instance: MessageService;
  private messageSubscriptions: Map<string, Unsubscribe> = new Map();
  private chatSubscriptions: Map<string, Unsubscribe> = new Map();
  private typingSubscriptions: Map<string, Unsubscribe> = new Map();

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  // ====================================
  // CHAT OPERATIONS
  // ====================================

  /**
   * Get or create a DM chat between two users
   */
  async getOrCreateDMChat(
    currentUserId: string,
    currentUserName: string,
    currentUserAvatar: string,
    partnerId: string,
    partnerName: string,
    partnerAvatar: string
  ): Promise<string> {
    try {
      // Check if chat already exists
      const chatsQuery = query(
        collection(db, 'chats'),
        where('type', '==', 'dm'),
        where('participants', 'array-contains', currentUserId)
      );

      const snapshot = await getDocs(chatsQuery);
      const existingChat = snapshot.docs.find((doc) => {
        const data = doc.data();
        return data.participants.includes(partnerId);
      });

      if (existingChat) {
        return existingChat.id;
      }

      // Create new chat
      const chatData: Omit<FirestoreChat, 'id'> = {
        type: 'dm',
        participants: [currentUserId, partnerId],
        participantDetails: [
          {
            userId: currentUserId,
            userName: currentUserName,
            userAvatar: currentUserAvatar,
          },
          {
            userId: partnerId,
            userName: partnerName,
            userAvatar: partnerAvatar,
          },
        ],
        lastMessage: '',
        lastMessageAt: serverTimestamp() as Timestamp,
        lastMessageSenderId: '',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        dmPartnerId: partnerId,
        unreadCount: {
          [currentUserId]: 0,
          [partnerId]: 0,
        },
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      console.log('✅ Created new DM chat:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating/getting DM chat:', error);
      throw error;
    }
  }

  /**
   * Get or create a community chat
   */
  async getOrCreateCommunityChat(
    communityId: string,
    communityName: string,
    communityAvatar: string,
    participants: string[]
  ): Promise<string> {
    try {
      // Check if community chat exists
      const chatsQuery = query(
        collection(db, 'chats'),
        where('type', '==', 'community'),
        where('communityId', '==', communityId)
      );

      const snapshot = await getDocs(chatsQuery);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }

      // Create new community chat
      const chatData: Omit<FirestoreChat, 'id'> = {
        type: 'community',
        participants,
        participantDetails: [], // Populated separately
        lastMessage: '',
        lastMessageAt: serverTimestamp() as Timestamp,
        lastMessageSenderId: '',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        communityId,
        name: communityName,
        avatar: communityAvatar,
        unreadCount: {},
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      console.log('✅ Created new community chat:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating/getting community chat:', error);
      throw error;
    }
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId: string): Promise<Conversation[]> {
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );

      const snapshot = await getDocs(chatsQuery);
      const conversations: Conversation[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as FirestoreChat;

        // Get partner info for DMs
        let name = data.name || '';
        let avatar = data.avatar || '';
        let online = false;

        if (data.type === 'dm') {
          const partner = data.participantDetails.find((p) => p.userId !== userId);
          if (partner) {
            name = partner.userName;
            avatar = partner.userAvatar;
            online = partner.online || false;
          }
        }

        conversations.push({
          id: doc.id,
          type: data.type,
          avatar,
          name,
          lastMessage: data.lastMessage,
          timestamp: this.formatTimestamp(data.lastMessageAt),
          unread: data.unreadCount?.[userId] || 0,
          online,
          communityId: data.communityId,
          courseId: data.courseId,
        });
      });

      return conversations;
    } catch (error) {
      console.error('❌ Error fetching user chats:', error);
      return [];
    }
  }

  /**
   * Subscribe to real-time chat updates
   */
  subscribeToUserChats(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): Unsubscribe {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const conversations: Conversation[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as FirestoreChat;

        let name = data.name || '';
        let avatar = data.avatar || '';
        let online = false;

        if (data.type === 'dm') {
          const partner = data.participantDetails.find((p) => p.userId !== userId);
          if (partner) {
            name = partner.userName;
            avatar = partner.userAvatar;
            online = partner.online || false;
          }
        }

        conversations.push({
          id: doc.id,
          type: data.type,
          avatar,
          name,
          lastMessage: data.lastMessage,
          timestamp: this.formatTimestamp(data.lastMessageAt),
          unread: data.unreadCount?.[userId] || 0,
          online,
          communityId: data.communityId,
          courseId: data.courseId,
        });
      });

      callback(conversations);
    });

    this.chatSubscriptions.set(userId, unsubscribe);
    return unsubscribe;
  }

  // ====================================
  // MESSAGE OPERATIONS
  // ====================================

  /**
   * Send a text message
   */
  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'course-link' | 'creation-link' = 'text',
    metadata?: FirestoreMessage['metadata']
  ): Promise<string> {
    try {
      const messageData: Omit<FirestoreMessage, 'id'> = {
        chatId,
        senderId,
        senderName,
        senderAvatar,
        content,
        timestamp: serverTimestamp() as Timestamp,
        type,
        metadata,
        emojis: [],
        read: false,
        readBy: [],
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);

      // Update chat's last message
      await this.updateChatLastMessage(chatId, content, senderId);

      console.log('✅ Message sent:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Upload file and send message
   */
  async sendFileMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    file: File,
    messageType: 'image' | 'file'
  ): Promise<string> {
    try {
      // Upload file to Firebase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `messages/${chatId}/${fileName}`;
      const fileRef = ref(storage, filePath);

      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      // For images, create thumbnail (optional - can be done later)
      const metadata: FirestoreMessage['metadata'] = {
        fileName: file.name,
        fileUrl,
        thumbnailUrl: messageType === 'image' ? fileUrl : undefined,
      };

      // Send message with file
      const content = messageType === 'image' ? 'Sent an image' : `Sent a file: ${file.name}`;
      return await this.sendMessage(
        chatId,
        senderId,
        senderName,
        senderAvatar,
        content,
        messageType,
        metadata
      );
    } catch (error) {
      console.error('❌ Error sending file message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a chat (paginated)
   */
  async getChatMessages(
    chatId: string,
    pageSize: number = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{ messages: Message[]; lastDoc: DocumentSnapshot | null }> {
    try {
      let messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        messagesQuery = query(messagesQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(messagesQuery);
      const messages: Message[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as FirestoreMessage;
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          content: data.content,
          timestamp: this.formatTimestamp(data.timestamp),
          type: data.type,
          metadata: data.metadata,
        });
      });

      // Reverse to show oldest first
      messages.reverse();

      return {
        messages,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      };
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return { messages: [], lastDoc: null };
    }
  }

  /**
   * Subscribe to real-time messages
   */
  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): Unsubscribe {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages: Message[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as FirestoreMessage;
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          content: data.content,
          timestamp: this.formatTimestamp(data.timestamp),
          type: data.type,
          metadata: data.metadata,
        });
      });

      callback(messages);
    });

    this.messageSubscriptions.set(chatId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Add emoji reaction to message
   */
  async addEmojiReaction(
    messageId: string,
    emoji: string,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const data = messageDoc.data() as FirestoreMessage;
      const emojis = data.emojis || [];

      // Check if user already reacted with this emoji
      const existingReaction = emojis.find(
        (e) => e.emoji === emoji && e.userId === userId
      );

      if (existingReaction) {
        // Remove reaction
        await updateDoc(messageRef, {
          emojis: emojis.filter((e) => !(e.emoji === emoji && e.userId === userId)),
        });
      } else {
        // Add reaction
        await updateDoc(messageRef, {
          emojis: [...emojis, { emoji, userId, userName }],
        });
      }

      console.log('✅ Emoji reaction updated');
    } catch (error) {
      console.error('❌ Error adding emoji reaction:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(messagesQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as FirestoreMessage;
        // Don't mark own messages as read
        if (data.senderId !== userId) {
          const readBy = data.readBy || [];
          batch.update(doc.ref, {
            read: true,
            readBy: [
              ...readBy,
              {
                userId,
                readAt: serverTimestamp(),
              },
            ],
          });
        }
      });

      await batch.commit();

      // Reset unread count for this chat
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0,
      });

      console.log('✅ Messages marked as read');
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  }

  // ====================================
  // TYPING INDICATORS
  // ====================================

  /**
   * Set typing status
   */
  async setTypingStatus(chatId: string, userId: string, userName: string): Promise<void> {
    try {
      const typingRef = doc(db, 'typing', `${chatId}_${userId}`);
      await updateDoc(typingRef, {
        userId,
        userName,
        chatId,
        timestamp: serverTimestamp(),
      }).catch(async () => {
        // Document doesn't exist, create it
        await addDoc(collection(db, 'typing'), {
          userId,
          userName,
          chatId,
          timestamp: serverTimestamp(),
        });
      });
    } catch (error) {
      console.error('❌ Error setting typing status:', error);
    }
  }

  /**
   * Remove typing status
   */
  async removeTypingStatus(chatId: string, userId: string): Promise<void> {
    try {
      const typingRef = doc(db, 'typing', `${chatId}_${userId}`);
      await deleteDoc(typingRef);
    } catch (error) {
      console.error('❌ Error removing typing status:', error);
    }
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(
    chatId: string,
    currentUserId: string,
    callback: (isTyping: boolean, userName?: string) => void
  ): Unsubscribe {
    const typingQuery = query(
      collection(db, 'typing'),
      where('chatId', '==', chatId)
    );

    const unsubscribe = onSnapshot(typingQuery, (snapshot) => {
      const typingUsers = snapshot.docs
        .map((doc) => doc.data() as TypingStatus)
        .filter((status) => {
          // Filter out current user and stale typing indicators (>5 seconds old)
          const isCurrentUser = status.userId === currentUserId;
          const timestamp = status.timestamp?.toMillis() || 0;
          const isStale = Date.now() - timestamp > 5000;
          return !isCurrentUser && !isStale;
        });

      if (typingUsers.length > 0) {
        callback(true, typingUsers[0].userName);
      } else {
        callback(false);
      }
    });

    this.typingSubscriptions.set(chatId, unsubscribe);
    return unsubscribe;
  }

  // ====================================
  // HELPER METHODS
  // ====================================

  /**
   * Update chat's last message
   */
  private async updateChatLastMessage(
    chatId: string,
    lastMessage: string,
    senderId: string
  ): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        console.error('Chat not found:', chatId);
        return;
      }

      const chatData = chatDoc.data() as FirestoreChat;
      const batch = writeBatch(db);

      // Update last message
      batch.update(chatRef, {
        lastMessage: lastMessage.substring(0, 100), // Truncate for preview
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: senderId,
        updatedAt: serverTimestamp(),
      });

      // Increment unread count for all participants except sender
      chatData.participants.forEach((participantId) => {
        if (participantId !== senderId) {
          batch.update(chatRef, {
            [`unreadCount.${participantId}`]: increment(1),
          });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('❌ Error updating last message:', error);
    }
  }

  /**
   * Format Firestore timestamp
   */
  private formatTimestamp(timestamp: Timestamp | undefined): string {
    if (!timestamp) return 'Just now';

    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  /**
   * Find or create a DM chat between two users
   */
  async findOrCreateDM(userId1: string, userId2: string): Promise<string> {
    try {
      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('type', '==', 'dm'),
        where('participants', 'array-contains', userId1)
      );

      const snapshot = await getDocs(q);
      const existingChat = snapshot.docs.find((doc) => {
        const data = doc.data();
        return data.participants.includes(userId2);
      });

      if (existingChat) {
        console.log('✅ Found existing DM chat:', existingChat.id);
        return existingChat.id;
      }

      // Create new DM chat
      console.log('📝 Creating new DM chat between', userId1, 'and', userId2);

      // Get user details
      const [user1Doc, user2Doc] = await Promise.all([
        getDoc(doc(db, 'users', userId1)),
        getDoc(doc(db, 'users', userId2)),
      ]);

      const user1Data = user1Doc.data();
      const user2Data = user2Doc.data();

      const newChatRef = await addDoc(chatsRef, {
        type: 'dm',
        participants: [userId1, userId2],
        participantDetails: [
          {
            userId: userId1,
            userName: user1Data?.displayName || user1Data?.email || 'User',
            userAvatar: user1Data?.photoURL || '',
            online: false,
          },
          {
            userId: userId2,
            userName: user2Data?.displayName || user2Data?.email || 'User',
            userAvatar: user2Data?.photoURL || '',
            online: false,
          },
        ],
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        dmPartnerId: userId2, // For userId1's perspective
        name: user2Data?.displayName || user2Data?.email || 'User',
        avatar: user2Data?.photoURL || '',
        unreadCount: { [userId1]: 0, [userId2]: 0 },
      });

      console.log('✅ Created new DM chat:', newChatRef.id);
      return newChatRef.id;
    } catch (error) {
      console.error('❌ Error finding/creating DM:', error);
      throw error;
    }
  }

  /**
   * Find or create a community chat
   */
  async findOrCreateCommunityChat(communityId: string, userId: string): Promise<string> {
    try {
      // Check if community chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('type', '==', 'community'),
        where('communityId', '==', communityId)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log('✅ Found existing community chat:', snapshot.docs[0].id);
        return snapshot.docs[0].id;
      }

      // Get community details
      const communityDoc = await getDoc(doc(db, 'communities', communityId));
      const communityData = communityDoc.data();

      if (!communityData) {
        throw new Error('Community not found');
      }

      // Create new community chat
      console.log('📝 Creating new community chat for:', communityId);

      const newChatRef = await addDoc(chatsRef, {
        type: 'community',
        participants: communityData.members || [userId],
        participantDetails: [],
        lastMessage: 'Welcome to the community chat!',
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        communityId,
        name: communityData.name || communityData.title || 'Community Chat',
        avatar: communityData.banner || communityData.avatar || '',
        unreadCount: {},
      });

      console.log('✅ Created new community chat:', newChatRef.id);
      return newChatRef.id;
    } catch (error) {
      console.error('❌ Error finding/creating community chat:', error);
      throw error;
    }
  }

  /**
   * Find or create a course chat
   */
  async findOrCreateCourseChat(courseId: string, userId: string): Promise<string> {
    try {
      // Check if course chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('type', '==', 'course'),
        where('courseId', '==', courseId)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log('✅ Found existing course chat:', snapshot.docs[0].id);
        return snapshot.docs[0].id;
      }

      // Get course details (check both collections)
      let courseData = null;
      let courseDoc = await getDoc(doc(db, 'courses_community', courseId));

      if (!courseDoc.exists()) {
        courseDoc = await getDoc(doc(db, 'courses_claim', courseId));
      }

      courseData = courseDoc.data();

      if (!courseData) {
        throw new Error('Course not found');
      }

      // Create new course chat
      console.log('📝 Creating new course chat for:', courseId);

      const newChatRef = await addDoc(chatsRef, {
        type: 'course',
        participants: [userId], // Add enrolled students later
        participantDetails: [],
        lastMessage: 'Welcome to the course discussion!',
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        courseId,
        name: courseData.title || 'Course Chat',
        avatar: courseData.thumbnail || '',
        unreadCount: {},
      });

      console.log('✅ Created new course chat:', newChatRef.id);
      return newChatRef.id;
    } catch (error) {
      console.error('❌ Error finding/creating course chat:', error);
      throw error;
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    this.messageSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.chatSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.typingSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.messageSubscriptions.clear();
    this.chatSubscriptions.clear();
    this.typingSubscriptions.clear();
    console.log('✅ Cleaned up all message subscriptions');
  }
}

// Export singleton instance
export const messageService = MessageService.getInstance();

export default MessageService;
