"use client";
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Xóa tất cả các cookie liên quan đến phiên đăng nhập
    deleteCookie('accessToken', { path: '/' });
    localStorage.removeItem('accessToken'); // Xóa cả từ localStorage
    sessionStorage.removeItem('accessToken'); // Xóa cả từ sessionStorage
    deleteCookie('userId', { path: '/' });
    deleteCookie('userEmail', { path: '/' });
    
    // Chuyển hướng người dùng về trang đăng nhập
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${className || ''}`}
    >
      Đăng xuất
    </button>
  );
}