import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow all API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/sound.mp3')
  ) {
    return NextResponse.next();
  }

  // Allow login page
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // For all other routes, let the client-side handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sound.mp3 (notification sound)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sound.mp3).*)',
  ],
};