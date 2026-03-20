import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LANGUAGES, Language } from '../translations';

interface LanguageSwitcherProps {
  currentLang: Language;
  onChange: (lang: Language) => void;
}

export function LanguageSwitcher({ currentLang, onChange }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === currentLang) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white hover:border-white/30 transition-all font-mono text-sm"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span className="text-[#8B95A8]">▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 glass-card rounded-2xl border border-white/10 overflow-hidden min-w-[160px]"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code as Language);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 font-mono text-sm transition-all hover:bg-white/5
                  ${currentLang === lang.code
                    ? 'text-[#AAFF45] bg-[#AAFF45]/5'
                    : 'text-[#8B95A8]'
                  }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {currentLang === lang.code && (
                  <span className="ml-auto text-[#AAFF45]">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}