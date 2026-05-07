import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 1. Rutas públicas y recursos estáticos
  if (path === '/login' || path.startsWith('/_next') || path === '/favicon.ico') {
    return NextResponse.next();
  }

  const userRol = request.cookies.get('session_user_rol')?.value;

  // 2. Si no hay sesión, al login
  if (!userRol) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Lógica para CONDUCTORES / EMPLEADOS
  if (userRol === 'empleado' || userRol === 'conductor') {
    // Si intentan entrar a panel admin, redirigir a sus entregas
    const adminPaths = ['/distribucion', '/reportes', '/seguimiento', '/entradas'];
    if (adminPaths.some(p => path.startsWith(p)) || path === '/') {
      return NextResponse.redirect(new URL('/mis-entregas', request.url));
    }
    // Permitir cualquier otra ruta (especialmente sus subrutas de mis-entregas)
    return NextResponse.next();
  }

  // 4. Lógica para ADMIN
  if (userRol === 'admin') {
    // El admin no debe estar en las rutas de conductor (opcional, pero limpio)
    if (path.startsWith('/mis-entregas') || path === '/') {
      return NextResponse.redirect(new URL('/distribucion', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
