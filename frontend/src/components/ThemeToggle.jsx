import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';

function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg border transition-all duration-300 ${
        isDark
          ? 'border-emerald-400/40 bg-emerald-950/50 text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-950/70'
          : 'border-amber-300/40 bg-amber-50/50 text-amber-600 hover:border-amber-300/60 hover:bg-amber-50/70'
      }`}
      title={isDark ? 'Aydınlık temaya geç' : 'Koyu temaya geç'}
    >
      {isDark ? (
        <FiSun className="text-lg" />
      ) : (
        <FiMoon className="text-lg" />
      )}
    </button>
  );
}

export default ThemeToggle;
