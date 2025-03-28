import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
interface HeaderProps {
  toggleSidebar?: () => void; // Optional function to toggle sidebar
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        // Gọi API logout
        await fetch('http://localhost:3002/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }).catch(error => {
          console.error('Error calling logout API:', error);
        });
      }
      
      // Xóa dữ liệu từ localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
      
      // Chuyển hướng đến trang đăng nhập
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Xóa token và chuyển hướng ngay cả khi có lỗi
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="w-full px-4 py-2 border-b border-gray-200 flex items-center justify-between bg-white">
      {/* Logo Section with Sidebar Toggle */}
      <div className="flex items-center gap-2">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
            aria-label="Toggle sidebar"
          >
            <span className="text-xl font-bold">=</span>
          </button>
        )}
        <div className="h-10 flex items-center">
          <Image
            src="/logo.png"
            alt="ProjectGW Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 hover:bg-gray-50 text-gray-700">
          Notification
        </button>
        <button 
          className={`px-4 py-2 hover:bg-gray-50 text-gray-700 ${isLoggingOut ? 'opacity-50' : ''}`}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>
    </header>
  );
};

export default Header;