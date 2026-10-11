import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type FontScale = 'normal' | 'large' | 'larger';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  resetFontScale: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('mahavote_theme') as Theme) || 'light';
  });

  const [fontScale, setFontScaleState] = useState<FontScale>(() => {
    return (localStorage.getItem('mahavote_font_scale') as FontScale) || 'normal';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mahavote_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-larger');
    root.classList.add(`font-scale-${fontScale}`);
    localStorage.setItem('mahavote_font_scale', fontScale);
  }, [fontScale]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setFontScale = (scale: FontScale) => {
    setFontScaleState(scale);
  };

  const resetFontScale = () => {
    setFontScaleState('normal');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontScale, setFontScale, resetFontScale }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
