import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
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


export const metadata: Metadata = {
  title: 'Ya Biso RDC - Découvrez l\'âme du Congo',
  description: 'Votre porte d\'entrée vers des paysages époustouflants, une culture riche et des aventures inoubliables en République Démocratique du Congo.',
  icons: {
    icon: 'https://res.cloudinary.com/dy73hzkpm/image/upload/v1764160177/favicon_loub9y.ico',
  },
  openGraph: {
    title: 'Ya Biso RDC - Découvrez l\'âme du Congo',
    description: 'Votre porte d\'entrée vers des paysages époustouflants, une culture riche et des aventures inoubliables en République Démocratique du Congo.',
    images: [
      {
        url: 'https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png',
        width: 1200,
        height: 630,
        alt: 'Logo Ya Biso RDC',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${montserrat.variable} h-full bg-background`}>
      <body className="font-body antialiased h-full">
        <div className="h-full w-full">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
