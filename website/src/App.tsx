import { Outlet, ScrollRestoration } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <HelmetProvider>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Outlet />
        <ScrollRestoration />
      </div>
    </HelmetProvider>
  );
}
