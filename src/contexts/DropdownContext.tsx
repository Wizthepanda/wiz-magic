import { createContext, useContext, useState, ReactNode } from 'react';

type DropdownType = 'wallet' | 'profile' | 'notifications' | 'messages' | null;

interface DropdownContextType {
  activeDropdown: DropdownType;
  setActiveDropdown: (dropdown: DropdownType) => void;
  closeAllDropdowns: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  const setDropdown = (dropdown: DropdownType) => {
    console.log('🔔 Dropdown Context: Setting active dropdown to:', dropdown, '(previous:', activeDropdown, ')');
    setActiveDropdown(dropdown);
  };

  const closeAllDropdowns = () => {
    console.log('🔔 Dropdown Context: Closing all dropdowns (current:', activeDropdown, ')');
    setActiveDropdown(null);
  };

  // Log when provider mounts
  console.log('✅ DropdownProvider mounted - context available');

  return (
    <DropdownContext.Provider value={{ activeDropdown, setActiveDropdown: setDropdown, closeAllDropdowns }}>
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdown = () => {
  const context = useContext(DropdownContext);

  // Log if context is missing (helps debug provider wrapping issues)
  if (!context) {
    console.warn('⚠️ useDropdown called but DropdownContext not available - ensure DropdownProvider wraps your component');
  }

  // Don't throw error - allow components to work without provider (backward compatibility)
  return context;
};
