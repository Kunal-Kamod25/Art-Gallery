'use client';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useEffect } from 'react';
import { useAuthStore } from '../lib/store';

export default function RootLayout({ children }) {
  const init = useAuthStore(s => s.init);
  useEffect(() => { init(); }, []);

  return (
    <html lang="en">
      <head>
        <title>Luminary Art Gallery</title>
        <meta name="description" content="Discover extraordinary art from world-class artists" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: 'Inter, sans-serif' } }} />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
