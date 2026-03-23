import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        color: theme === 'dark' ? '#fbbf24' : '#6366f1',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--accent-primary-dim)';
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {theme === 'dark' ? (
        <>
          <Moon size={18} fill="#fbbf24" />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            fontSize: '8px',
            color: '#fbbf24',
            fontWeight: '700',
          }}>🌙</span>
        </>
      ) : (
        <>
          <Sun size={18} fill="#f59e0b" />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            fontSize: '8px',
            color: '#f59e0b',
            fontWeight: '700',
          }}>☀️</span>
        </>
      )}
    </button>
  );
}
