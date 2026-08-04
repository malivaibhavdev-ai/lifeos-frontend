import { useEffect, useState } from 'react';

// Web replacement for the mobile app's useColorScheme() — OS/browser scheme
// only, no persisted override, matching current mobile behavior (see
// RootNavigator.js). Toggles the `dark` class on <html> for Tailwind's
// `darkMode: 'class'` strategy.
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDark(e.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return isDark;
}
