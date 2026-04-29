'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, UserRoundIcon } from 'lucide-react';

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

import { AccessTokenPayload } from '@/types/types';
import Image from 'next/image';

interface NavbarProps {
  extraRight?: React.ReactNode;
  session: AccessTokenPayload | null;
}

export function Navbar({ extraRight, session }: NavbarProps) {
  const pathname = usePathname();
  if (hideNavbarOnRoutes.some((route) => pathname?.startsWith(route)))
    return null;

  const items = getVisibleNavItems(navItems, session);

  return (
    <header className="border-b border-border bg-card backdrop-blur-s">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Logo" height={50} width={80} />
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
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
              {session == null ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">{labels.common.login}</Link>
                  </Button>
                  <ThemeSwitch />
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>
                    {session.firstName} {session.lastName}
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

                  {session == null ? (
                    <>
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer w-full hover:bg-primary/10 rounded-md"
                      >
                        <Link
                          href="/login"
                          className="flex justify-between items-center gap-2 px-4 py-2 w-full"
                        >
                          <span>{labels.common.login}</span>
                          <UserRoundIcon className="h-4 w-4 text-foreground/70" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        dir="rtl"
                        className="cursor-pointer flex justify-start px-1 py-0"
                      >
                        <ThemeSwitch />
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-primary/10 rounded-md">
                      <span className="truncate">
                        {session.firstName} {session.lastName}
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
