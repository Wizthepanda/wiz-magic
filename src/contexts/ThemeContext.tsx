import React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { useTheme as useNextTheme } from 'next-themes';

// Re-export useTheme hook for existing components
export const useTheme = () => {
  const { theme, setTheme } = useNextTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="wiz-theme"
      themes={['light', 'dark']}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemeProvider>
  );
};