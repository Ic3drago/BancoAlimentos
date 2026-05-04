import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths
  if (path === '/login' || path.startsWith('/_next') || path === '/favicon.ico') {
    return NextResponse.next();
  }

  const userRol = request.cookies.get('session_user_rol')?.value;

  if (!userRol) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role based access
  if (userRol === 'empleado' || userRol === 'conductor') {
    if (path !== '/mis-entregas') {
      return NextResponse.redirect(new URL('/mis-entregas', request.url));
    }
  }

  if (userRol === 'admin') {
    if (path === '/mis-entregas' || path === '/') {
      return NextResponse.redirect(new URL('/distribucion', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
