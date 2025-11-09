/**
 * useDropdownTrigger - Shared hook for dropdown trigger logic
 * Ensures consistent behavior across all dropdowns
 */

import { useRef, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useDropdown } from '@/contexts/DropdownContext';

type DropdownType = 'wallet' | 'profile' | 'notifications' | 'messages';

interface UseDropdownTriggerReturn {
  isOpen: boolean;
  handleTriggerPointerDown: (event: ReactPointerEvent) => void;
  handleTriggerClick: (event: ReactMouseEvent) => void;
  handleTriggerKeyDown: (event: ReactKeyboardEvent) => void;
  handleClose: () => void;
  justOpenedRef: React.MutableRefObject<boolean>;
}

export function useDropdownTrigger(name: DropdownType): UseDropdownTriggerReturn {
  const dropdownContext = useDropdown();
  const triggerPointerDownRef = useRef(false);
  const justOpenedRef = useRef(false);

  // Check if dropdown is open
  const isOpen = dropdownContext?.activeDropdown === name;

  const handleToggle = useCallback(() => {
    if (!dropdownContext) {
      console.warn(`⚠️ DropdownContext not available for "${name}" dropdown`);
      return;
    }

    const willOpen = !isOpen;
    console.log(`🔄 Toggle "${name}" dropdown:`, { willOpen, currentActive: dropdownContext.activeDropdown });

    if (willOpen) {
      justOpenedRef.current = true;
    }

    dropdownContext.setActiveDropdown(isOpen ? null : name);
  }, [dropdownContext, isOpen, name]);

  const handleTriggerPointerDown = useCallback((event: ReactPointerEvent) => {
    // Only handle left mouse button
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    triggerPointerDownRef.current = true;
    event.preventDefault();
    event.stopPropagation();
    handleToggle();
  }, [handleToggle]);

  const handleTriggerClick = useCallback((event: ReactMouseEvent) => {
    // Prevent double-firing if already handled by pointerDown
    if (triggerPointerDownRef.current) {
      triggerPointerDownRef.current = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handleToggle();
  }, [handleToggle]);

  const handleTriggerKeyDown = useCallback((event: ReactKeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      dropdownContext?.setActiveDropdown(null);
    }
  }, [handleToggle, isOpen, dropdownContext]);

  const handleClose = useCallback(() => {
    console.log(`🔒 Close "${name}" dropdown`);
    dropdownContext?.setActiveDropdown(null);
  }, [dropdownContext, name]);

  return {
    isOpen,
    handleTriggerPointerDown,
    handleTriggerClick,
    handleTriggerKeyDown,
    handleClose,
    justOpenedRef,
  };
}
