import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle SES lockdown compatibility for Google APIs
if (typeof window !== 'undefined') {
  // Preserve critical intrinsics before lockdown
  const originalDatePrototype = Date.prototype;
  const originalConsoleWarn = console.warn;

  // Override console.warn to suppress SES lockdown warnings
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' &&
        (message.includes('Removing unpermitted intrinsics') ||
         message.includes('Removing intrinsics.%DatePrototype%') ||
         message.includes('lockdown-install'))) {
      // Suppress SES lockdown warnings that don't affect functionality
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  // Handle potential SES lockdown if it occurs
  Object.defineProperty(window, 'handleSESLockdown', {
    value: () => {
      try {
        // Restore critical functionality if needed
        if (!Date.prototype.toTemporalInstant && originalDatePrototype.toTemporalInstant) {
          Date.prototype.toTemporalInstant = originalDatePrototype.toTemporalInstant;
        }
      } catch (error) {
        // Silently handle any restoration errors
      }
    },
    writable: false,
    enumerable: false,
    configurable: false
  });
}

createRoot(document.getElementById("root")!).render(<App />);
