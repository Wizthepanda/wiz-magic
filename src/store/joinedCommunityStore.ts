import { create } from 'zustand';
import { CommunityData } from '@/hooks/useJoinedCommunities';

interface Store {
  joinedCommunities: CommunityData[];
  setJoinedCommunities: (data: CommunityData[]) => void;
}

export const useJoinedCommunityStore = create<Store>(set => ({
  joinedCommunities: [],
  setJoinedCommunities: data => set({ joinedCommunities: data }),
}));
