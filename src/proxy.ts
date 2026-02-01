import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from './lib/server/tokens';
import {
  ACTIVE_STATUS,
  INVITED_STATUS,
  Role,
  SUSPENDED_STATUS,
} from '@/types/types';
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/invite/*',
  '/suspended',
  '/plan',
];

type RouteRule = {
  matcher: RegExp;
  allowedRoles: Role[];
};

const routeRules: RouteRule[] = [
  {
    matcher: /^\/dashboard(\/.*)?$/,
    allowedRoles: Object.keys(Role) as Role[],
  },
  {
    matcher: /^\/account(\/.*)?$/,
    allowedRoles: Object.keys(Role) as Role[],
  },
];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isPublicRoute = publicRoutes.some((route) => {
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2);
      return path.startsWith(baseRoute);
    }
    return path === route;
  });

  const cookie = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value || null;
  const accessToken = cookie ? await verifyAccessToken(cookie) : null;

  const userId = accessToken?.userId;
  const role = accessToken?.role;
  const status = accessToken?.status;

  // Prevent logged-in users from accessing /login , /signup, /invite/*
  if (isPublicRoute) {
    if (
      userId &&
      (path === '/signup' || path === '/login' || path.startsWith('/invite'))
    ) {
      return NextResponse.redirect(new URL('/account/', req.nextUrl));
    }

    return NextResponse.next();
  }

  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (status !== ACTIVE_STATUS) {
    switch (status) {
      case INVITED_STATUS:
        return NextResponse.redirect(new URL('/invite', req.nextUrl));
      case SUSPENDED_STATUS:
        return NextResponse.redirect(new URL('/suspended', req.nextUrl));
      default:
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
  }

  // 2) Role-based protection
  const rule = routeRules.find((r) => r.matcher.test(path));

  if (!rule) {
    return NextResponse.next();
  }

  // If route has a rule, user must be logged in
  if (!userId || !role) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (!rule.allowedRoles.includes(role)) {
    // logged in but wrong role
    // return NextResponse.redirect(new URL('/not-authorized', req.nextUrl));
    // OR:
    return NextResponse.redirect(new URL('/forbidden', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
