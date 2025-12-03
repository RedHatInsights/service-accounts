import React from 'react';
import { createRoot } from 'react-dom/client';
import AppEntry from './AppEntry';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<AppEntry />);
  rootElement.setAttribute('data-ouia-safe', 'true');
}
