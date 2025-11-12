import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요한 경로
const protectedRoutes = [
  '/dashboard',
  '/products',
  '/leads',
  '/campaigns',
  '/opportunities',
  '/clients',
  '/tasks',
  '/workflows',
];

// 인증을 필요로 하지 않는 경로 (로그인, 회원가입 등)
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // API 요청은 미들웨어에서 처리하지 않음 (API 요청 무한 루프 방지)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // 토큰이 있는지 확인 (쿠키에서 확인)
  const isAuthenticated = request.cookies.has('sessionid'); // Django sessionid 쿠키 확인
  
  // 인증이 필요한 페이지에 접근하려고 할 때 로그인 상태가 아니면 로그인 페이지로 리다이렉트
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 이미 로그인된 상태에서 인증 페이지(로그인, 회원가입 등)에 접근하면 대시보드로 리다이렉트
  if (authRoutes.some(route => pathname === route) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 루트 경로("/")에 접근하면 로그인 여부에 따라 리다이렉트
  if (pathname === '/') {
    return isAuthenticated
      ? NextResponse.redirect(new URL('/dashboard', request.url))
      : NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/products/:path*',
    '/leads/:path*',
    '/campaigns/:path*',
    '/opportunities/:path*',
    '/clients/:path*',
    '/tasks/:path*',
    '/workflows/:path*',
  ],
}; 