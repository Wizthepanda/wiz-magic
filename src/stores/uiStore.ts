/**
 * UI Store - Manages global UI state for dropdowns and modals
 * Ensures only one dropdown/modal is open at a time to prevent overlapping
 */

import { create } from 'zustand';

interface UIState {
  openDropdown: string | null;
  openModal: string | null;
  setDropdown: (id: string | null) => void;
  setModal: (id: string | null) => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  openDropdown: null,
  openModal: null,

  setDropdown: (id) => set({ openDropdown: id, openModal: null }),

  setModal: (id) => set({ openModal: id, openDropdown: null }),

  closeAll: () => set({ openDropdown: null, openModal: null }),
}));
