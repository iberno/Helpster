import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppWrapper from './App.jsx';
import { AlertProvider } from './contexts/AlertContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AlertProvider>
      <AppWrapper />
    </AlertProvider>
  </StrictMode>
);