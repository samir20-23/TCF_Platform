import React from 'react';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import '../styles/tailwind.css';
import '../styles/index.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'TCF Canada — Préparation complète au TCF',
    template: '%s | TCF Canada',
  },
  description:
    "Préparez-vous efficacement au TCF Canada avec nos simulations chronométrées, corrections professionnelles et suivi personnalisé. Maximisez vos chances pour l'immigration au Canada.",
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    siteName: 'TCF Canada',
    title: 'TCF Canada — Préparation complète au TCF',
    description:
      "Simulations d'examen réelles, corrections personnalisées et suivi en ligne. Votre meilleure préparation au TCF Canada.",
  },
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="min-h-screen antialiased" suppressHydrationWarning>
            <AuthProvider>
              <React.Suspense fallback={null}>
                {children}
              </React.Suspense>
              <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
              },
              error: {
                style: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
