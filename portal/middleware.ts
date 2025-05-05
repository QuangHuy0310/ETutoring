import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Định nghĩa cấu trúc của token sau khi giải mã
interface DecodedToken {
  id: string;
  email: string;
  role: string;
  name?: string;
  exp: number;
  iat: number;
}

// Định nghĩa route restriction - chỉ có admin, user, tutor và staff
const ADMIN_ROUTES = ['/admin', '/dashboard/admin'];
const USER_ROUTES = ['/', '/dashboard/user'];
const TUTOR_ROUTES = ['/', '/dashboard/tutor', '/tutor'];
const STAFF_ROUTES = ['/staff', '/staff/listofuser', '/staff/matching', '/staff/managerblog', '/staff/managermatching'];
// Chỉ giữ lại những route không yêu cầu login
const AUTH_FREE_ROUTES = ['/login', '/register'];

// Middleware sẽ chạy trước khi request đến server
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua middleware cho các tài nguyên tĩnh
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/favicon.ico') ||
    pathname.startsWith('/static') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.jpeg') ||
    pathname.includes('.svg') ||
    pathname.includes('.ico')
  ) {
    return NextResponse.next();
  }

  // Cho phép truy cập các route không cần xác thực
  if (AUTH_FREE_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
// Kiểm tra nếu đã có token hợp lệ và đang cố gắng vào trang login/register
    // thì chuyển hướng về trang chính theo role
    const token = request.cookies.get('accessToken')?.value;
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          const { role } = decodedToken;
          if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
          if (role === 'user' || role === 'tutor') return NextResponse.redirect(new URL('/', request.url));
          if (role === 'staff') return NextResponse.redirect(new URL('/staff', request.url));
        }
      } catch (error) {
        // Token lỗi, cho phép truy cập login/register
      }
    }
    return NextResponse.next();
  }

  // Kiểm tra token trong cookie
  const token = request.cookies.get('accessToken')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const { role } = decodedToken;
    // Phân quyền truy cập
    switch(role) {
      case 'admin':
        return NextResponse.next();
      case 'user':
        if (USER_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/', request.url));
      case 'tutor':
        if (TUTOR_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/', request.url));
      case 'staff':
        if (STAFF_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
          return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/staff', request.url));
      default:
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};