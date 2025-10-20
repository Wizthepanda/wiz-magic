import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  isSidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  sidebarWidth: number;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const sidebarWidth = isSidebarExpanded ? 280 : 80;

  const setSidebarExpanded = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  };

  return (
    <LayoutContext.Provider value={{ isSidebarExpanded, setSidebarExpanded, sidebarWidth }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
