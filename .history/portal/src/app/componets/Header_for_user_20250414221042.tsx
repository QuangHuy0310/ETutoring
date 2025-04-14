import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSocket } from '@/app/contexts/SocketContext';
import { getCookie } from "cookies-next";

interface HeaderForUserProps {
  toggleSidebar?: () => void; // Optional function to toggle sidebar
}

interface SearchResult {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface Notification {
  id: number;
  title: string;
  message?: string;
  time: string;
  isRead: boolean;
  type?: string;
  link?: string;
}

const Header_for_user: React.FC<HeaderForUserProps> = ({ toggleSidebar }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [searchBy, setSearchBy] = useState<'name' | 'email'>('name');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  
  // Notification states
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Lấy thông tin người dùng từ cookies khi component mount
  useEffect(() => {
    const accessToken = getCookie('accessToken') as string;
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
  
  // Listen for notifications
  useEffect(() => {
    if (!socket) return;
    
    // Listen for general notifications
    socket.on('newNotification', (notification) => {
      console.log('Received notification:', notification);
      addNotification({
        id: Date.now(),
        title: typeof notification === 'string' ? notification : notification.title || 'New notification',
        message: typeof notification === 'object' ? notification.message : undefined,
        time: new Date().toISOString(),
        isRead: false,
        type: typeof notification === 'object' ? notification.type : 'general'
      });
    });
    
    // Listen for matching request notifications
    socket.on('newMatchingRequestNotification', (notification) => {
      console.log('Received matching request:', notification);
      addNotification({
        id: Date.now(),
        title: 'New Matching Request',
        message: typeof notification === 'string' ? notification : 'You have a new matching request',
        time: new Date().toISOString(),
        isRead: false,
        type: 'matching-request'
      });
    });
    
    // Listen for comment notifications
    socket.on('newComment', (data) => {
      console.log('Received comment notification:', data);
      addNotification({
        id: Date.now(),
        title: 'New Comment',
        message: `New comment on document: ${data.documentId || 'Unknown'}`,
        time: new Date().toISOString(),
        isRead: false,
        type: 'comment',
        link: data.documentId ? `/document/${data.documentId}` : undefined
      });
    });
    
    return () => {
      socket.off('newNotification');
      socket.off('newMatchingRequestNotification');
      socket.off('newComment');
    };
  }, [socket]);
  
  // Function to add a notification
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 20)); // Keep only 20 most recent notifications
  };
  
  // Function to mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };
  
  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };
  
  // Function to handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Handle navigation if link exists
    if (notification.link) {
      router.push(notification.link);
    }
    
    // Close dropdown
    setShowNotifications(false);
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Format time for display
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  // Xử lý click bên ngoài dropdown để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Xử lý chuyển đến trang profile của người dùng
  const viewUserProfile = (userId: string) => {
    if (!userId) return;
    router.push(`/information/view?idUser=${userId}`);
    setSearchResults([]);
    setSearchTerm("");
  };
  
  // Hàm tìm kiếm
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const accessToken = getCookie('accessToken') as string;
      let url;
      
      // Xác định URL dựa vào option tìm kiếm
      if (searchBy === 'email') {
        url = `http://localhost:3002/get-infors?email=${encodeURIComponent(searchTerm)}`;
      } else {
        url = `http://localhost:3002/get-infors?name=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Xử lý dữ liệu trả về
        let results: SearchResult[] = [];
        if (data && data.data && Array.isArray(data.data)) {
          results = data.data;
        } else if (Array.isArray(data)) {
          results = data;
        } else if (data && typeof data === 'object') {
          results = [data];
        }
        
        setSearchResults(results);
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
      const accessToken = getCookie('accessToken') as string;
      
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
      
      // Xóa cookie thay vì localStorage
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Chuyển hướng đến trang đăng nhập
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Xóa cookie và chuyển hướng ngay cả khi có lỗi
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
          <div className="flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={`Search by ${searchBy}...`}
                className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            {/* Search Type Selector */}
            <div className="relative">
              <select 
                className="px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value as 'name' | 'email')}
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
              </select>
            </div>
            
            {/* Search Button */}
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div 
            ref={searchResultsRef}
            className="absolute z-20 mt-1 w-full max-w-xl bg-white border border-gray-200 rounded-md shadow-lg"
          >
            <ul className="max-h-60 overflow-auto">
              {searchResults.map((result, index) => (
                <li 
                  key={index} 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                  onClick={() => viewUserProfile(result._id || result.id || "")}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-black mr-3">
                      {result.name ? result.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-medium">{result.name || 'No name'}</div>
                      <div className="text-sm text-gray-500">{result.email || 'No email'}</div>
                      {result.role && (
                        <div className="text-xs bg-gray-200 text-gray-700 rounded px-1 inline-block mt-1">
                          {result.role}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-4">
        {/* Notification Component */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="px-4 py-2 hover:bg-gray-50 text-gray-700 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
          </button>
          
          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    className="text-sm text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start">
                          <div className={`w-2 h-2 mt-2 rounded-full mr-2 ${!notification.isRead ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{notification.title}</p>
                            {notification.message && (
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.time)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className="px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2"
            onClick={toggleUserDropdown}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-black">
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