import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import LayoutWrapper from "@/components/LayoutWrapper";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.messidor-patrimoine.com'),
  title: {
    default: "Messidor Patrimoine - Cabinet de Gestion de Patrimoine au Maroc | OPCVM, OPCI, Bourse",
    template: "%s | Messidor Patrimoine"
  },
  description: "Cabinet de gestion de patrimoine marocain spécialisé dans les actifs financiers : OPCVM, OPCI, actions Bourse de Casablanca et portefeuilles personnalisés. Conseils indépendants et accompagnement sur-mesure.",
  keywords: ["gestion patrimoine maroc", "opcvm maroc", "opci maroc", "bourse casablanca", "investissement maroc", "conseiller financier maroc", "gestion actifs maroc", "family office maroc", "patrimoine financier", "investir au maroc"],
  authors: [{ name: "Messidor Patrimoine" }],
  creator: "Messidor Patrimoine",
  publisher: "Messidor Patrimoine",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: 'https://www.messidor-patrimoine.com',
    title: 'Messidor Patrimoine - Cabinet de Gestion de Patrimoine au Maroc',
    description: 'Cabinet de gestion de patrimoine marocain spécialisé dans les actifs financiers : OPCVM, OPCI, actions Bourse de Casablanca et portefeuilles personnalisés.',
    siteName: 'Messidor Patrimoine',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Messidor Patrimoine - Gestion de Patrimoine au Maroc',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Messidor Patrimoine - Cabinet de Gestion de Patrimoine au Maroc',
    description: 'Cabinet de gestion de patrimoine marocain spécialisé dans les actifs financiers : OPCVM, OPCI, actions et portefeuilles personnalisés.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google53cadb16cbff81b9',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <OrganizationSchema />
        <WebSiteSchema />
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
