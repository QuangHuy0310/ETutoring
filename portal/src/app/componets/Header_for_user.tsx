import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderForUserProps {
  toggleSidebar?: () => void; // Optional function to toggle sidebar
}

const Header_for_user: React.FC<HeaderForUserProps> = ({ toggleSidebar }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Lấy thông tin người dùng từ localStorage khi component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        // Giải mã JWT để lấy thông tin
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload.name) {
            setUserName(payload.name);
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);
  
  // Xử lý click bên ngoài dropdown để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Hàm tìm kiếm
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3002/get-infors?name=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error('Search error:', response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Xử lý khi nhấn Enter trong input search
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Xử lý logout
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
      setShowDropdown(false);
    }
  };

  // Toggle dropdown của user
  const toggleUserDropdown = () => {
    setShowDropdown(!showDropdown);
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
      
      {/* Search Bar */}
      <div className="flex-1 mx-4 max-w-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-black rounded-md hover:bg-blue-600"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full max-w-xl bg-white border border-gray-200 rounded-md shadow-lg">
            <ul className="max-h-60 overflow-auto">
              {searchResults.map((result, index) => (
                <li key={index} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-gray-500">{result.email || 'No email'}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 hover:bg-gray-50 text-gray-700">
          Notification
        </button>
        
        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className="px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2"
            onClick={toggleUserDropdown}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span>{userName}</span>
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <Link href="/information" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Information
              </Link>
              <button 
                className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 ${isLoggingOut ? 'opacity-50' : ''}`}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header_for_user;