'use client';

import { useEffect, useSyncExternalStore } from 'react';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();

const emitThemeChange = () => {
  listeners.forEach((listener) => listener());
};

const getBrowserTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem('theme');

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const subscribeToTheme = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getBrowserTheme,
    () => 'light'
  );

  useEffect(() => {
    window.localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    window.localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    emitThemeChange();
  };

  return (
    <button
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={toggleTheme}
      className="fixed bottom-5 right-5 z-50 grid h-11 w-11 place-items-center rounded-md border border-app surface text-app shadow-drop-1 transition hover:-translate-y-0.5 hover:shadow-drop-3"
    >
      {theme === 'light' ? (
        <DarkModeOutlinedIcon fontSize="small" />
      ) : (
        <LightModeOutlinedIcon fontSize="small" />
      )}
    </button>
  );
}
