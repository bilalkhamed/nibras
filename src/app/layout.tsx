import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { getCurrentUser } from '@/lib/server/current-user';
import { Suspense } from 'react';
import { NavbarWrapper } from '@/components/layout/navbar-wrapper';
import { CustomToaster } from '@/components/common/custom-toaster';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'نبراس - منصة تعليمية للفتيات',
  description:
    'منصة تعليمية شاملة تجمع برامج القراءة والمحاضرات وطمأنينة القلب للطالبات من عمر 12-17 سنة',
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
