import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, updateDoc, getDoc, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import type { CreateCommunityForm } from '@/lib/schemas/community';
import { useToast } from './use-toast';

export interface CommunityData extends Omit<CreateCommunityForm, 'publishDate'> {
  id: string;
  creatorId: string;
  createdAt: any;
  updatedAt: any;
  publishedAt?: any;
  publishDate?: any;
}

// Create community hook
export const useCreateCommunity = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<CreateCommunityForm, 'status'> & { status?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const communityData: Omit<CommunityData, 'id'> = {
        ...data,
        creatorId: user.uid,
        creatorName: user.displayName || 'Unknown Creator',
        creatorAvatar: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: data.status || 'draft'
      };

      const docRef = await addDoc(collection(db, 'communities'), communityData);
      return { id: docRef.id, ...communityData };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communities', 'drafts'] });
      toast({
        title: "Community created!",
        description: "Your community has been saved as a draft.",
      });
    },
    onError: (error) => {
      console.error('Error creating community:', error);
      toast({
        title: "Creation failed",
        description: "There was an error creating your community. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Update community hook
export const useUpdateCommunity = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCommunityForm> }) => {
      const communityRef = doc(db, 'communities', id);

      // Clean data to remove undefined values completely
      const cleanedData = deepClean(data);

      const updateData = {
        ...cleanedData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(communityRef, updateData);
      return { id, ...updateData };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community', data.id] });
    },
    onError: (error) => {
      console.error('Error updating community:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your community. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Publish community hook
export const usePublishCommunity = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, publishDate }: { id: string; publishDate?: Date }) => {
      const communityRef = doc(db, 'communities', id);

      // Get current community data to determine routing
      const communityDoc = await getDoc(communityRef);
      if (!communityDoc.exists()) {
        throw new Error('Community not found');
      }

      const communityData = communityDoc.data() as CommunityData;
      const isScheduled = publishDate && publishDate > new Date();

      const updateData = {
        status: isScheduled ? 'scheduled' : 'published',
        publishedAt: isScheduled ? null : serverTimestamp(),
        publishDate: publishDate ? publishDate : null,
        updatedAt: serverTimestamp()
      };

      await updateDoc(communityRef, updateData);

      // Call existing backend endpoints based on pricing model
      // DO NOT CHANGE ROUTING LOGIC - use existing backend paths
      if (!isScheduled) {
        await publishToExistingFlow(communityData);
      }

      return { id, ...updateData, communityData };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community', data.id] });

      const isScheduled = data.publishDate && data.publishDate > new Date();

      toast({
        title: isScheduled ? "Community scheduled!" : "Community published!",
        description: isScheduled
          ? `Your community will be published on ${data.publishDate?.toLocaleDateString()}.`
          : "Your community is now live and discoverable!",
      });
    },
    onError: (error) => {
      console.error('Error publishing community:', error);
      toast({
        title: "Publishing failed",
        description: "There was an error publishing your community. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Helper function to publish to existing backend flows
// DO NOT CHANGE - uses existing routing logic
async function publishToExistingFlow(communityData: CommunityData) {
  try {
    const isFree = communityData.zapsRequired === 0 && communityData.usdCoPay === 0;

    if (isFree) {
      // Publish to Community discovery (existing endpoint)
      await fetch('/api/communities/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: communityData.id,
          type: 'community',
          tier: 'free'
        })
      });
    } else {
      // Publish to XP Shop/Rewards (existing endpoint)
      await fetch('/api/rewards/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: communityData.id,
          type: 'community',
          tier: 'paid',
          zapsRequired: communityData.zapsRequired,
          usdPrice: communityData.usdCoPay
        })
      });
    }
  } catch (error) {
    console.error('Error calling existing backend flow:', error);
    // Don't throw - community is still published to Firestore
  }
}

// Get community by ID
export const useCommunity = (id: string) => {
  return useQuery({
    queryKey: ['community', id],
    queryFn: async () => {
      const ref = doc(db, 'communities', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('Community not found');
      return { id: snap.id, ...snap.data() };
    },
    enabled: !!id,
  });
};

// Join community hook
export const useJoinCommunity = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Add user to community members subcollection
      await setDoc(doc(db, 'communities', communityId, 'members', user.uid), {
        joinedAt: serverTimestamp(),
        role: 'member',
        displayName: user.displayName || 'Member',
        avatarUrl: user.photoURL || '',
        level: 1,
        progress: 0
      });

      // Update members array in main community document
      const communityRef = doc(db, 'communities', communityId);
      const communitySnap = await getDoc(communityRef);
      
      if (communitySnap.exists()) {
        const currentMembers = communitySnap.data().members || [];
        if (!currentMembers.includes(user.uid)) {
          await updateDoc(communityRef, {
            members: [...currentMembers, user.uid],
            membersCount: (communitySnap.data().membersCount || 0) + 1
          });
        }
      }

      return { communityId, userId: user.uid };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community', data.communityId] });
      queryClient.invalidateQueries({ queryKey: ['joinedCommunities', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['communityMembers', data.communityId] });
      
      toast({
        title: "Welcome! 🎉",
        description: "You've successfully joined the community!",
      });
    },
    onError: (error) => {
      console.error('Error joining community:', error);
      toast({
        title: "Join failed",
        description: "There was an error joining the community. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Get user's draft communities
export const useDraftCommunities = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['communities', 'drafts', user?.uid],
    queryFn: async () => {
      if (!user) return [];

      try {
        const draftsQuery = query(
          collection(db, 'communities'),
          where('creatorId', '==', user.uid),
          where('status', '==', 'draft'),
          orderBy('updatedAt', 'desc')
        );

        const snapshot = await getDocs(draftsQuery);
        const drafts: CommunityData[] = [];

        snapshot.forEach((doc) => {
          drafts.push({
            id: doc.id,
            ...doc.data()
          } as CommunityData);
        });

        console.log(`✅ Loaded ${drafts.length} draft communities`);
        return drafts;
      } catch (error) {
        console.error('Error fetching draft communities:', error);
        return [];
      }
    },
    enabled: !!user
  });
};

// Deep clean function to remove undefined, File objects, and invalid Firestore values
const deepClean = (obj: any): any => {
  // Return null for null/undefined - these will be filtered out at object level
  if (obj === null || obj === undefined) return undefined;

  // Don't allow File objects, Blob objects, or functions
  if (obj instanceof File || obj instanceof Blob || typeof obj === 'function') {
    return undefined;
  }

  if (Array.isArray(obj)) {
    return obj
      .map(item => deepClean(item))
      .filter(item => item !== undefined);
  }

  // Only clean plain objects, not class instances
  if (typeof obj === 'object' && obj.constructor === Object) {
    const cleaned: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip undefined values, 'file' keys, and File/Blob objects completely
      if (value === undefined || key === 'file' || value instanceof File || value instanceof Blob) {
        continue;
      }

      const cleanedValue = deepClean(value);

      // Only add to object if the cleaned value is not undefined
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }

    return cleaned;
  }

  // Return primitives, dates, and Firestore Timestamps as-is
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || obj instanceof Date || obj instanceof Timestamp) {
    return obj;
  }

  return undefined;
};

// Save draft hook with optimistic updates
export const useSaveDraft = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, silent = true }: { id?: string; data: Partial<CreateCommunityForm>; silent?: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      // Strip out large file data from coverMedia to avoid payload size limits
      const sanitizedCoverMedia = data.coverMedia?.map(media => ({
        url: media.url,
        thumbnail: media.thumbnail,
        type: media.type,
        videoId: media.videoId
        // Exclude 'file' and any base64 data
      })) || [];

      // Sanitize modules to remove File objects
      const sanitizedModules = data.modules?.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        videos: module.videos?.map(video => ({
          url: video.url,
          thumbnail: video.thumbnail,
          title: video.title,
          description: video.description,
          videoId: video.videoId,
          type: video.type
        })) || []
      })) || [];

      // Sanitize downloads to remove File objects
      const sanitizedDownloads = data.downloads?.map(download => ({
        id: download.id,
        title: download.title,
        description: download.description,
        url: download.url,
        type: download.type,
        size: download.size
      })) || [];

      // Deep clean to remove all undefined values and invalid objects
      const cleanedData = deepClean({
        ...data,
        coverMedia: sanitizedCoverMedia,
        modules: sanitizedModules,
        downloads: sanitizedDownloads,
      });

      const draftData = {
        ...cleanedData,
        status: 'draft',
        updatedAt: serverTimestamp()
      };

      if (id) {
        // Update existing draft
        const communityRef = doc(db, 'communities', id);
        await updateDoc(communityRef, draftData);
        return { id, ...draftData, silent };
      } else {
        // Create new draft
        const docRef = await addDoc(collection(db, 'communities'), {
          ...draftData,
          creatorId: user.uid,
          creatorName: user.displayName || 'Unknown Creator',
          creatorAvatar: user.photoURL || '',
          createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...draftData, silent };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communities', 'drafts'] });

      // Only show toast if not silent mode
      if (!data.silent) {
        toast({
          title: "Draft saved!",
          description: "Your progress has been saved.",
        });
      }
    },
    onError: (error) => {
      console.error('Error saving draft:', error);
      toast({
        title: "Save failed",
        description: "Could not save your draft. Please try again.",
        variant: "destructive"
      });
    }
  });
};