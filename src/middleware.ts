import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Allow access to auth routes
  if (request.nextUrl.pathname.startsWith('/auth')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check for file access
  if (request.nextUrl.pathname.startsWith('/api/files') || request.nextUrl.pathname.startsWith('/uploads')) {
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || '';
    const authKey = request.headers.get('authorization');

    // Extract file ID or name from the URL
    const fileIdentifier = request.nextUrl.pathname.split('/').pop() || '';

    // Use the new API route path
    const url = new URL('/api/file-access', request.url);
    url.searchParams.append('fileIdentifier', fileIdentifier);
    url.searchParams.append('clientIp', clientIp);
    if (authKey) {
      url.searchParams.append('authKey', authKey);
    }

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
      }

      // If all checks pass, allow access to the file
      return NextResponse.next();
    } catch (error) {
      console.error('Error in middleware:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  // For all other routes, require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};