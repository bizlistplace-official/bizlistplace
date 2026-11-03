import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bizlistplace.com'),
  title: {
    default: 'BizListPlace.com — Worldwide Verified Business Directory',
    template: '%s | BizListPlace.com',
  },
  description:
    'Discover verified companies, contractors, manufacturers, suppliers, and branch locations worldwide on BizListPlace.com. Explore authentic ratings and contact info.',
  keywords: [
    'BizListPlace',
    'BizListPlace.com',
    'business directory',
    'worldwide directory',
    'verified companies',
    'b2b directory',
    'company reviews',
    'branch locations',
    'global yellow pages',
  ],
  authors: [{ name: 'BizListPlace Team' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'BizListPlace.com',
    title: 'BizListPlace.com — Worldwide Verified Business Directory',
    description:
      'Search and discover verified companies and branch locations worldwide on BizListPlace.com.',
    images: [
      {
        url: '/apple-touch-icon.png',
        width: 180,
        height: 180,
        alt: 'BizListPlace.com Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizListPlace.com — Worldwide Verified Business Directory',
    description:
      'Search and discover verified companies and branch locations worldwide on BizListPlace.com.',
    images: ['/apple-touch-icon.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preload primary local variable font to eliminate font render-blocking & chaining */}
        <link
          rel="preload"
          href="/fonts/plus-jakarta-sans-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Deferred sanitization during browser idle to avoid forced reflows during critical rendering */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var cleanExt = function() {
                  document.querySelectorAll('[bis_skin_checked], [bis_register]').forEach(function(el) {
                    el.removeAttribute('bis_skin_checked');
                    el.removeAttribute('bis_register');
                  });
                };
                if ('requestIdleCallback' in window) {
                  window.requestIdleCallback(cleanExt, { timeout: 2000 });
                } else {
                  setTimeout(cleanExt, 500);
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body
        className="flex flex-col min-h-screen overflow-x-hidden w-full max-w-full font-sans"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-grow w-full max-w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
