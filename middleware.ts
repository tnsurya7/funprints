import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Remove wildcard CORS header from HTML page responses and private routes
  response.headers.delete('access-control-allow-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all application routes except static asset files
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|apple-icon.png).*)',
  ],
};
