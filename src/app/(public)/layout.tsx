import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      {children}
    </main>
  );
}
