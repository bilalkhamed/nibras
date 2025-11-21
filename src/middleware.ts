import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from './lib/tokens';
import { Role } from '@/types/types';
const publicRoutes = ['/login', '/signup'];

type RouteRule = {
  matcher: RegExp;
  allowedRoles: Role[];
};

const routeRules: RouteRule[] = [
  { matcher: /^\/dashboard(\/.*)?$/, allowedRoles: ['admin'] },
  {
    matcher: /^\/account(\/.*)?$/,
    allowedRoles: ['admin', 'supervisor', 'student'],
  },
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value || null;
  const accessToken = cookie ? await verifyAccessToken(cookie) : null;

  const userId = accessToken?.userId;
  const role = accessToken?.role as Role;

  // 1) Public routes: redirect logged-in users away from /login, /signup
  if (isPublicRoute && userId) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  // 2) Role-based protection
  const rule = routeRules.find((r) => r.matcher.test(path));

  if (!rule) {
    // no rule → route is public
    return NextResponse.next();
  }

  // If route has a rule, user must be logged in
  if (!userId || !role) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (!rule.allowedRoles.includes(role)) {
    // logged in but wrong role
    // you can either 403 or redirect somewhere safe
    // return NextResponse.redirect(new URL('/not-authorized', req.nextUrl));
    // OR:
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}
