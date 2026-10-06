import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import GlobeStage from './components/GlobeStage';

// `?poster` renders only the globe on a transparent page; scripts/make-poster.mjs screenshots it.
const posterMode = new URLSearchParams(window.location.search).has('poster');
if (posterMode) {
  document.documentElement.style.background = 'transparent';
  document.body.style.background = 'transparent';
}

createRoot(document.getElementById('root')!).render(<StrictMode>{posterMode ? <GlobeStage poster /> : <App />}</StrictMode>);
