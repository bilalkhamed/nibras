import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Suspense } from 'react';
import { NavbarWrapper } from '@/components/layout/navbar-wrapper';
import { CustomToaster } from '@/components/common/custom-toaster';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'نبراس',
  description:
    'برنامجُ نبراس هو أحدُ برامجِ مِشكاة، وهو برنامجٌ مخصّصٌ للشّابات اليافعات ضمن الفئة العمريّة 12-17 سنة، يهدفُ لبناءِ شخصيّاتٍ فعّالة، ومؤثّرة، وقياديّة في المجتمع',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <html
        lang="ar"
        dir="rtl"
        suppressHydrationWarning
        data-scroll-behavior="smooth"
      >
        <body
          className={`${ibmPlexSansArabic.className} antialiased min-h-screen`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Suspense>
              <NavbarWrapper />
            </Suspense>
            {children}
          </ThemeProvider>
          <CustomToaster />
        </body>
      </html>
    </Suspense>
  );
}
