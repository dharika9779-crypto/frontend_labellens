import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

const THEME_KEY = 'labellens_theme';

export function getTheme(): 'dark' | 'light' {
  try {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') ?? 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(theme: 'dark' | 'light') {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(getTheme());

  // Apply saved theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 font-mono text-sm ${
        theme === 'light'
          ? 'border-amber-400/40 bg-amber-400/10 text-amber-500 hover:bg-amber-400/20 hover:border-amber-400'
          : 'border-white/10 bg-white/5 text-[#8B95A8] hover:border-white/30 hover:text-white'
      } ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </motion.div>
      <span className="hidden sm:inline">
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </motion.button>
  );
}
