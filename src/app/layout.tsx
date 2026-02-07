import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Toaster } from "@/components/ui/toaster";
import { SoundProvider } from "@/contexts/sound-context";
import { GlobalLoader } from "@/components/loading/global-loader";
import './globals.css';
import { Inter, Montserrat } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF8800',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://studio-3821305079-74f59.firebaseapp.com'),
  title: 'Ya Biso RDC - Découvrez l\'âme du Congo',
  description: 'Votre porte d\'entrée vers des paysages époustouflants, une culture riche et des aventures inoubliables en République Démocratique du Congo.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ya Biso RDC',
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Ya Biso RDC - Découvrez l\'âme du Congo',
    description: 'Votre porte d\'entrée vers des paysages époustouflants, une culture riche et des aventures inoubliables en République Démocratique du Congo.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ya Biso RDC - Découvrez l\'âme du Congo',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ya Biso RDC - Découvrez l\'âme du Congo',
    description: 'Votre porte d\'entrée vers des paysages époustouflants, une culture riche et des aventures inoubliables en République Démocratique du Congo.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${montserrat.variable} h-full bg-background`} suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Ya Biso RDC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ya Biso RDC" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#FF8800" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-body antialiased h-full" suppressHydrationWarning>
        {/* reCAPTCHA Enterprise pour Firebase Phone Authentication */}
        <Script
          src="https://www.google.com/recaptcha/enterprise.js?render=6LcmLSUsAAAAAOMudj7WEMUnOvHoRZo0JyORN3ia"
          strategy="afterInteractive"
        />
        {/* Service Worker Registration */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker enregistré avec succès:', registration.scope);
                    },
                    function(err) {
                      console.log('Échec de l\\'enregistrement du Service Worker:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
        <SoundProvider>
          <GlobalLoader />
          <div className="h-full w-full">
            {children}
          </div>
          <Toaster />
        </SoundProvider>
      </body>
    </html>
  );
}
