/**
 * src/App.jsx — Root Application Component
 *
 * Wraps the entire app with:
 *  1. AuthProvider — makes user/login/logout available everywhere
 *  2. BrowserRouter — enables React Router navigation
 *  3. Toaster — global toast notification container
 *  4. AppRouter — renders the correct page for the current URL
 */

import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications — positioned top-right, auto-dismiss after 4s */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f8fafc' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f8fafc' },
            },
          }}
        />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
