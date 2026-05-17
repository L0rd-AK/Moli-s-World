import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Noto_Serif_Bengali } from 'next/font/google';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth-provider';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageTransition } from '@/components/page-transition';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-serif-bengali',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Bengali Literary Platform',
    template: '%s | Bengali Literary Platform',
  },
  description: 'A modern full-stack platform for Bengali literature, poetry, and book reviews',
  keywords: ['Bengali', 'literature', 'poetry', 'blog', 'book reviews', 'kobita', 'probondho'],
  authors: [{ name: 'Admin' }],
  creator: 'Bengali Literary Platform',
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Bengali Literary Platform',
    description: 'A modern full-stack platform for Bengali literature',
    siteName: 'Bengali Literary Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bengali Literary Platform',
    description: 'A modern full-stack platform for Bengali literature',
    creator: '@bengaliliterature',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${inter.variable} ${notoSerifBengali.variable} ${playfairDisplay.variable}`}>
      <body className="min-h-screen  font-bengali text-ink-200 antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navigation />
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}