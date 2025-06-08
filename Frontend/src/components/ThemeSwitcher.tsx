import { useEffect, useState } from 'react';

const themes = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
  'silk',
];

// Global theme management to prevent conflicts
let globalTheme: string | null = null;

// Initialize theme immediately (before React renders)
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    // Check if we already have a global theme set
    if (globalTheme) return globalTheme;

    const saved = localStorage.getItem('theme');
    const theme = saved || 'dark';
    globalTheme = theme;
    return theme;
  }
  return 'dark';
};

// Set theme on document immediately
const initialTheme = getInitialTheme();
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialTheme);
}

export default function ThemeSwitcher() {
  // Always use the current theme from localStorage, not the initial value
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  // Update theme and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    globalTheme = theme; // Update global reference
  }, [theme]);

  // Sync theme between tabs and components
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue && e.newValue !== theme) {
        setTheme(e.newValue);
        document.documentElement.setAttribute('data-theme', e.newValue);
        globalTheme = e.newValue;
      }
    };

    // Also listen for custom theme events
    const onThemeChange = (e: CustomEvent) => {
      if (e.detail && e.detail !== theme) {
        setTheme(e.detail);
        globalTheme = e.detail;
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('themeChange', onThemeChange as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('themeChange', onThemeChange as EventListener);
    };
  }, [theme]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    globalTheme = newTheme;
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('themeChange', { detail: newTheme }));
  };

  return (
    <div className="dropdown w-full">
      <div tabIndex={0} role="button" className="btn w-full">
        Tema: {theme.charAt(0).toUpperCase() + theme.slice(1)}
        <svg
          width="12px"
          height="12px"
          className="inline-block h-2 w-2 fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content bg-base-300 rounded-box z-50 w-52 p-2 shadow-2xl overflow-y-auto max-h-72"
      >
        {themes.map((t) => (
          <li key={t}>
            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-base-200 rounded">
              <input
                type="radio"
                name="theme-controller"
                className="theme-controller"
                value={t}
                checked={theme === t}
                onChange={() => handleThemeChange(t)}
              />
              <span className="capitalize">{t}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
