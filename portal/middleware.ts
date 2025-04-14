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
const USER_ROUTES = ['/', '/dashboard/user'];
const TUTOR_ROUTES = ['/', '/dashboard/tutor'];
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
    
    // Nếu user đang cố gắng truy cập trang chủ (/) và có role là user hoặc tutor
    if (pathname === '/' && (role === 'user' || role === 'tutor')) {
      return NextResponse.next();
    }
    
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
    
    // Tự động chuyển hướng user và tutor đến trang home nếu đang truy cập trang khác không được phép
    if (role === 'user' || role === 'tutor') {
      const isUserAllowed = USER_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
      const isTutorAllowed = TUTOR_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
      
      if (role === 'user' && !isUserAllowed) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      if (role === 'tutor' && !isTutorAllowed) {
        return NextResponse.redirect(new URL('/', request.url));
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