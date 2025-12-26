'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Menu } from 'lucide-react';

import labels from '@/lib/labels.json';
import { navItems, hideNavbarOnRoutes } from '@/lib/shared/site.config';
import { getVisibleNavItems } from '@/lib/shared/utils';

import { Button } from '../ui/button';
import { ThemeSwitch } from '../common/theme-switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { User } from '@/types/types';

interface NavbarProps {
  extraRight?: React.ReactNode;
  user: User | null;
}

export function Navbar({ extraRight, user }: NavbarProps) {
  const pathname = usePathname();
  if (hideNavbarOnRoutes.includes(pathname)) return null;

  const items = getVisibleNavItems(navItems, user);

  return (
    <header className="border-b border-border bg-card backdrop-blur-s">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                {labels.common.appName}
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {extraRight}

            {/* DESKTOP USER */}
            <div className="hidden md:flex items-center gap-3">
              {user == null ? (
                <>
                  <Button variant="primary" asChild>
                    <Link href="/login">{labels.common.login}</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/signup">{labels.common.signup}</Link>
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                  <ThemeSwitch />
                </div>
              )}
            </div>

            {/* MOBILE MENU */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="inline-block bg-card/70 backdrop-blur-xl border border-border rounded-md py-1"
                  style={{ minWidth: 'auto' }}
                >
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.href}
                        asChild
                        className="cursor-pointer w-full hover:bg-primary/10 transition-colors rounded-md"
                      >
                        <Link
                          href={item.href}
                          className="flex justify-between items-center gap-2 px-4 py-2 w-full"
                        >
                          <span>{item.label}</span>
                          <Icon className="h-4 w-4 text-foreground/70" />
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator />

                  {user == null ? (
                    <>
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer w-full hover:bg-primary/10 rounded-md"
                      >
                        <Link
                          href="/login"
                          className="flex justify-between items-center px-4 py-2 w-full"
                        >
                          <span>{labels.common.login}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer w-full hover:bg-primary/10 rounded-md"
                      >
                        <Link
                          href="/signup"
                          className="flex justify-between items-center px-4 py-2 w-full"
                        >
                          <span>{labels.common.signup}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer w-full flex justify-center"
                      >
                        <ThemeSwitch />
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-primary/10 rounded-md">
                      <span className="truncate">
                        {user.firstName} {user.lastName}
                      </span>
                      <ThemeSwitch />
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
