import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize theme on page load
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Update theme icon based on current theme
function updateThemeIcon() {
  const theme = document.documentElement.getAttribute('data-theme');
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
}

// Listen for theme changes
const observer = new MutationObserver(updateThemeIcon);
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme']
});

// Initial update
setTimeout(updateThemeIcon, 100);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
