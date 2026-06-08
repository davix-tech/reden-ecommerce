import type { Metadata } from 'next';
import { getOrCreateSessionId } from '@/lib/session';
import './globals.css';
import RedenProvider from '@/components/RedenProvider';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Reden Ecommerce',
  description: 'Production-grade ecommerce platform for REDEN SDK integration testing',
  viewport: 'width=device-width, initial-scale=1',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionId = await getOrCreateSessionId();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Reden Ecommerce" />
        <meta property="og:description" content="Premium online marketplace" />
      </head>
      <body>
        <RedenProvider sessionId={sessionId}>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </RedenProvider>
      </body>
    </html>
  );
}
