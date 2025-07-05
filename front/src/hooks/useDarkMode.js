import { useState, useEffect } from 'react';

const useDarkMode = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'; // Default for SSR or non-browser environments
    }

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme; // Use stored preference
    }

    // If no stored preference, check OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement; // Target the <html> element
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      // Save the current theme to localStorage
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // The localStorage.setItem is handled by the useEffect now
      return newTheme;
    });
  };

  return [theme, toggleTheme];
};

export default useDarkMode;