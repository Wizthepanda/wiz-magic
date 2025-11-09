/**
 * HeaderDropdown - Generic dropdown component using Floating UI + Radix Portal
 * Provides consistent positioning, animations, and behavior for all header dropdowns
 */

import React, { useRef, useEffect, ReactNode } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Portal from '@radix-ui/react-portal';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  type Placement,
} from '@floating-ui/react-dom';
import { useDropdown } from '@/contexts/DropdownContext';
import { dropdownMotion } from '@/lib/dropdown-animations';
import { cn } from '@/lib/utils';

type DropdownType = 'wallet' | 'profile' | 'notifications' | 'messages';

interface HeaderDropdownProps {
  /** Dropdown identifier for context */
  name: DropdownType;
  /** Trigger element (button, avatar, etc.) */
  trigger: ReactNode;
  /** Dropdown content */
  children: ReactNode;
  /** Floating UI placement (default: 'bottom-end') */
  placement?: Placement;
  /** Offset from trigger in pixels (default: 12) */
  offsetDistance?: number;
  /** Additional className for dropdown container */
  className?: string;
  /** Trigger className */
  triggerClassName?: string;
  /** Show pointer triangle */
  showPointer?: boolean;
  /** Pointer className */
  pointerClassName?: string;
}

export const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  name,
  trigger,
  children,
  placement = 'bottom-end',
  offsetDistance = 12,
  className,
  triggerClassName,
  showPointer = true,
  pointerClassName,
}) => {
  const dropdownContext = useDropdown();
  const [standaloneIsOpen, setStandaloneIsOpen] = React.useState(false);

  // Support both context-based and standalone mode
  const isOpen = dropdownContext
    ? dropdownContext.activeDropdown === name
    : standaloneIsOpen;

  const justOpenedRef = useRef(false);
  const triggerPointerDownRef = useRef(false);

  // Floating UI setup with autoUpdate
  const { x, y, strategy, refs, update } = useFloating({
    placement,
    middleware: [
      offset(offsetDistance),
      flip({
        fallbackAxisSideDirection: 'start',
        padding: 8,
      }),
      shift({ padding: 8 }),
    ],
  });

  // Auto-update position when dropdown is open
  useEffect(() => {
    if (!isOpen || !refs.reference.current || !refs.floating.current) {
      return;
    }

    // Use autoUpdate to handle position updates
    return autoUpdate(
      refs.reference.current,
      refs.floating.current,
      update
    );
  }, [isOpen, refs.reference, refs.floating, update]);

  const handleToggle = () => {
    if (dropdownContext) {
      const willOpen = !isOpen;
      if (willOpen) {
        justOpenedRef.current = true;
      }
      dropdownContext.setActiveDropdown(isOpen ? null : name);
    } else {
      const willOpen = !isOpen;
      if (willOpen) {
        justOpenedRef.current = true;
      }
      setStandaloneIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    if (dropdownContext) {
      dropdownContext.setActiveDropdown(null);
    } else {
      setStandaloneIsOpen(false);
    }
  };

  const handleTriggerPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    triggerPointerDownRef.current = true;
    event.preventDefault();
    event.stopPropagation();
    handleToggle();
  };

  const handleTriggerClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (triggerPointerDownRef.current) {
      triggerPointerDownRef.current = false;
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    handleToggle();
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      handleClose();
    }
  };

  // Handle clicks outside dropdown and ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ignore if we just opened
      if (justOpenedRef.current) {
        justOpenedRef.current = false;
        return;
      }

      if (
        refs.floating.current &&
        !refs.floating.current.contains(event.target as Node) &&
        refs.reference.current &&
        !refs.reference.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      // Add listeners on next tick to avoid closing immediately
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      justOpenedRef.current = false;
    };
  }, [isOpen, refs.floating, refs.reference]);

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        ref={refs.setReference}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onPointerDown={handleTriggerPointerDown}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        className={cn('cursor-pointer', triggerClassName)}
      >
        {trigger}
      </div>

      {/* Dropdown - Portal Rendered with Floating UI positioning */}
      <Portal.Root>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Pointer Triangle */}
              {showPointer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'fixed w-3 h-3 rotate-45 border-t border-l border-white/20 shadow-lg',
                    pointerClassName
                  )}
                  style={{
                    position: strategy,
                    top: y ? y - 6 : 0,
                    left: x ? x + 12 : 0,
                    zIndex: 9998,
                  }}
                />
              )}

              {/* Dropdown Content */}
              <motion.div
                ref={refs.setFloating}
                {...dropdownMotion}
                className={cn(
                  'fixed rounded-2xl overflow-hidden',
                  className
                )}
                style={{
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                  zIndex: 9999,
                }}
              >
                {children}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal.Root>
    </div>
  );
};
