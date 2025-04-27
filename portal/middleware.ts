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
        
        // Kiểm tra token còn hạn
        if (decodedToken.exp * 1000 > Date.now()) {
          const { role } = decodedToken;
          
          // Chuyển hướng dựa vào role
          if (role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
          } else if (role === 'user') {
            return NextResponse.redirect(new URL('/', request.url));
          } else if (role === 'tutor') {
            return NextResponse.redirect(new URL('/', request.url));
          } else if (role === 'staff') {
            return NextResponse.redirect(new URL('/staff', request.url));
          }
        }
      } catch (error) {
        // Nếu có lỗi khi giải mã token, tiếp tục cho phép truy cập trang login/register
        console.error('Token verification failed:', error);
      }
    }
    
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
    console.log('User role:', role, 'Pathname:', pathname);
    
    // Xử lý theo role và path
    switch(role) {
      case 'admin':
        // Admin có quyền truy cập tất cả các trang
        return NextResponse.next();
      
      case 'user':
        // Nếu là trang chính hoặc trang user được phép
        if (USER_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
          return NextResponse.next();
        }
        // Nếu không, chuyển hướng về trang chính
        return NextResponse.redirect(new URL('/', request.url));
      
      case 'tutor':
        // Nếu là trang chính hoặc trang tutor được phép
        if (TUTOR_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
          return NextResponse.next();
        }
        // Nếu không, chuyển hướng về trang chính
        return NextResponse.redirect(new URL('/', request.url));
        
      case 'staff':
        // Nếu là trang staff được phép
        if (STAFF_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
          return NextResponse.next();
        }
        // Nếu không, chuyển hướng về trang staff
        return NextResponse.redirect(new URL('/staff', request.url));
        
      default:
        // Với các role khác không xác định, chuyển về login
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
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