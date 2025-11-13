// src/store/usePostViewStore.ts

import { create } from "zustand";

interface PostViewState {
  activePost: any | null;
  openPost: (post: any) => void;
  closePost: () => void;
}

export const usePostViewStore = create<PostViewState>((set) => ({
  activePost: null,
  openPost: (post) => set({ activePost: post }),
  closePost: () => set({ activePost: null }),
}));
