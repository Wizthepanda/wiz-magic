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
    console.log('🔔 Dropdown Context: Setting active dropdown to:', dropdown);
    setActiveDropdown(dropdown);
  };

  const closeAllDropdowns = () => {
    console.log('🔔 Dropdown Context: Closing all dropdowns');
    setActiveDropdown(null);
  };

  return (
    <DropdownContext.Provider value={{ activeDropdown, setActiveDropdown: setDropdown, closeAllDropdowns }}>
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  // Don't throw error - allow components to work without provider (backward compatibility)
  return context;
};
