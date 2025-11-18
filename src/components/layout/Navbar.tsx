'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutDashboard, Home, NotebookPen } from 'lucide-react';
import labels from '@/lib/labels.json';
import config from '@/lib/site.config';
import { Button } from '../ui/button';
import { ThemeSwitch } from '../ThemeSwitch';

interface NavbarProps {
  showAuthLinks?: boolean;
  extraRight?: React.ReactNode;
}

export function Navbar({ showAuthLinks = true, extraRight }: NavbarProps) {
  const pathname = usePathname();
  if (config.hideNavbarOnRoutes.includes(pathname)) {
    return null;
  }
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                {labels.common.appName}
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground">
              <Link
                href="/"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Home className="h-4 w-4" /> الرئيسية
              </Link>
              <Link
                href="/plan"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <NotebookPen className="h-4 w-4" /> خطة البرنامج
              </Link>
              <Link
                href="/dashboard"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <LayoutDashboard className="h-4 w-4" /> الإدارة
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {extraRight}
            {showAuthLinks && (
              <div className="flex items-center gap-3 text-sm font-medium">
                <Button variant="primary" asChild>
                  <Link href="/login">{labels.common.login}</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/signup">{labels.common.signup}</Link>
                </Button>
                <ThemeSwitch />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
