import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Super admin routes protection
  if (pathname.startsWith('/super-admin/')) {
    // Allow access to auth routes
    if (pathname.startsWith('/super-admin/auth/')) {
      return NextResponse.next();
    }
    
    // Check for super admin token
    const superAdminToken = request.cookies.get('super-admin-token')?.value;
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!superAdminToken && !authToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  // Mobile routes protection
  if (pathname.startsWith('/mobile/')) {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken && pathname !== '/mobile') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  // Dashboard routes protection
  if (pathname.startsWith('/dashboard/') || pathname === '/dashboard') {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/journeys',
    '/users', 
    '/clients',
    '/crew',
    '/audit',
    '/settings',
    '/storage'
  ];
  
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const authToken = request.cookies.get('auth-token')?.value;
    const superAdminToken = request.cookies.get('super-admin-token')?.value;
    
    if (!authToken && !superAdminToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/mobile/:path*', 
    '/dashboard/:path*',
    '/journeys/:path*',
    '/users/:path*',
    '/clients/:path*',
    '/crew/:path*',
    '/audit/:path*',
    '/settings/:path*',
    '/storage/:path*'
  ]
}; 