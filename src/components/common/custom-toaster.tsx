import { Toaster } from 'sonner';

import { IBM_Plex_Sans_Arabic } from 'next/font/google';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
});

export function CustomToaster() {
  return (
    <Toaster
      richColors
      className="rounded-2xl"
      position="top-center"
      style={{
        fontFamily: ibmPlexSansArabic.style.fontFamily,
        borderRadius: '1rem',
      }}
    />
  );
}
