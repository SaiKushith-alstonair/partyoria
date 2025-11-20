import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Register service worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch(() => console.log('SW registration failed'));
  });
}

const container = document.getElementById('root');
if (!container) {
  console.error('🚨 Root element not found! Make sure index.html has a div with id="root"');
  throw new Error('Root element not found');
}

const root = createRoot(container);

try {
  root.render(<App />);
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('🚨 Failed to render React app:', error);
  throw error;
}