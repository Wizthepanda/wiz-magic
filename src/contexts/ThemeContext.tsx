import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if we're in the browser and get saved theme or default to light
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('wiz-theme') as Theme;
      return savedTheme || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('wiz-theme', theme);

    // Apply theme to document root
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply CSS custom properties for smooth transitions
    root.style.setProperty('--theme-transition', 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};