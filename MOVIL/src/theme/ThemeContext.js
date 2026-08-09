import { createContext, useContext, useMemo, useState } from 'react';
import { light, dark, spacing, radius, typography } from './palette';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [scheme, setScheme] = useState('light');

  const value = useMemo(() => {
    const colors = scheme === 'dark' ? dark : light;
    return {
      scheme,
      isDark: scheme === 'dark',
      colors,
      spacing,
      radius,
      typography,
      toggleScheme: () => setScheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    };
  }, [scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme debe usarse dentro de un ThemeProvider');
  return ctx;
}
