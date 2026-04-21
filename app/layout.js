import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import PageViewTracker from '@/components/PageViewTracker';
import { getContent } from '@/lib/db';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const siteUrl = 'https://www.bydproperties.rw';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BYD Properties — Premium Real Estate & Construction in Rwanda',
    template: '%s | BYD Properties',
  },
  description:
    "Rwanda's #1 trusted real estate & construction company. Browse luxury properties for sale and rent in Kigali. 14+ years of excellence, 350+ projects delivered.",
  keywords: [
    'real estate Rwanda',
    'properties for sale Kigali',
    'properties for rent Kigali',
    'construction company Rwanda',
    'luxury apartments Kigali',
    'BYD Properties',
    'Rwanda property market',
    'property investment Rwanda',
    'architecture Rwanda',
    'architecture Kigali',
    'architecture design Kigali',
    'architecture design Rwanda',
    'architecture design',
  ],
  authors: [{ name: 'BYD Properties', url: siteUrl }],
  creator: 'BYD Properties',
  publisher: 'BYD Properties',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: 'BYD Properties — Premium Real Estate & Construction in Rwanda',
    description: "Rwanda's trusted partner in premium real estate and construction since 2010. Explore luxury properties in Kigali.",
    type: 'website',
    url: siteUrl,
    siteName: 'BYD Properties',
    locale: 'en_RW',
    images: [
      {
        url: '/logo-transparent.png',
        width: 1200,
        height: 630,
        alt: 'BYD Properties — Premium Real Estate Rwanda',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BYD Properties — Premium Real Estate & Construction in Rwanda',
    description: "Rwanda's trusted real estate & construction company. Browse properties in Kigali.",
    images: ['/logo-transparent.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default async function RootLayout({ children }) {
  const content = await getContent();
  const contact = content?.contact || {};

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'BYD Properties',
    description: "Rwanda's trusted partner in premium construction, real estate, and property development since 2010.",
    url: 'https://www.bydproperties.rw',
    telephone: contact.phone || '+250788661932',
    email: contact.email || 'info@bydproperties.rw',
    foundingDate: '2010',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kigali',
      addressCountry: 'RW',
    },
    areaServed: { '@type': 'Country', name: 'Rwanda' },
    sameAs: [],
  };

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Navbar />
        <PageViewTracker />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
