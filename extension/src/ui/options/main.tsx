import React from 'react';
import ReactDOM from 'react-dom/client';
import OptionsApp from './OptionsApp';

// Create a root element for React
const root = document.createElement('div');
root.id = 'mailguard-root';
root.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>
);
