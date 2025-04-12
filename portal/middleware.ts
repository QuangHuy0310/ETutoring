import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Định nghĩa cấu trúc của token sau khi giải mã
interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

// Định nghĩa route restriction - chỉ có admin, user, tutor và staff
const ADMIN_ROUTES = ['/admin', '/dashboard/admin'];
const USER_ROUTES = ['/profile', '/dashboard/user'];
const TUTOR_ROUTES = ['/tutor', '/dashboard/tutor'];
const STAFF_ROUTES = ['/staff', '/staff/listofuser', '/staff/matching', '/staff/managerblog', '/staff/managermatching'];
const PUBLIC_ROUTES = ['/login', '/register', '/about', '/contact', '/debug-token'];

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

  // Thêm route debug-token để xem thông tin về token
  if (pathname === '/debug-token') {
    return NextResponse.next();
  }

  // Cho phép truy cập public routes mà không cần token
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Kiểm tra token trong cookie
  const token = request.cookies.get('accessToken')?.value;
  
  // Nếu không có token, chuyển hướng đến trang login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Giải mã token để lấy thông tin role
    const decodedToken = jwtDecode<DecodedToken>(token);
    
    // Kiểm tra token hết hạn
    if (decodedToken.exp * 1000 < Date.now()) {
      // Nếu token hết hạn, chuyển hướng về trang login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Kiểm tra role và phân quyền truy cập
    const { role } = decodedToken;
    
    // Kiểm tra quyền truy cập cho admin routes
    if (ADMIN_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (role !== 'admin') {
        // Nếu không phải admin, chuyển hướng đến trang không có quyền
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
    
    // Kiểm tra quyền truy cập cho user routes
    if (USER_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (role !== 'user' && role !== 'admin') {
        // Nếu không phải user hoặc admin, chuyển hướng đến trang không có quyền
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Kiểm tra quyền truy cập cho tutor routes
    if (TUTOR_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (role !== 'tutor' && role !== 'admin') {
        // Nếu không phải tutor hoặc admin, chuyển hướng đến trang không có quyền
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Kiểm tra quyền truy cập cho staff routes
    if (STAFF_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (role !== 'staff' && role !== 'admin') {
        // Nếu không phải staff hoặc admin, chuyển hướng đến trang không có quyền
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
    
    // Thêm header cho các thông tin có thể cần thiết
    const response = NextResponse.next();
    response.headers.set('x-user-role', role);
    
    return response;
  } catch (error) {
    // Nếu có lỗi khi giải mã token, chuyển hướng đến trang login
    console.error('Token verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Định nghĩa các route mà middleware sẽ áp dụng
export const config = {
  matcher: [
    // Áp dụng cho tất cả các route ngoại trừ những routes đã định nghĩa trong middleware
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};