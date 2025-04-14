import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';

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
  id: string;
  title: string;
  createdAt: string;
  read: boolean;
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
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Thêm state cho notification
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');

  // Khởi tạo socket và kết nối khi component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    // Khởi tạo kết nối socket
    const socketInstance = io('http://localhost:3008', {
      transports: ['websocket'],
      query: { token: accessToken }
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected!');
      setConnectionStatus('connected');
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected!');
      setConnectionStatus('disconnected');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnectionStatus('error');
    });

    // Lắng nghe các sự kiện thông báo
    socketInstance.on('newNotification', (notification) => {
      console.log('Received notification:', notification);
      handleNewNotification(notification);
    });

    socketInstance.on('newMessage', (msg) => {
      console.log('Received new message:', msg);
      handleNewNotification({
        id: Date.now().toString(),
        title: `New message from ${msg.senderId}`,
        createdAt: new Date().toISOString(),
        read: false
      });
    });

    socketInstance.on('newComment', (data) => {
      console.log('Received new comment:', data);
      handleNewNotification({
        id: Date.now().toString(),
        title: `New comment in ${data.roomId || 'a document'}`,
        createdAt: new Date().toISOString(),
        read: false
      });
    });

    socketInstance.on('newMatchingRequestNotification', (notification) => {
      console.log('Received matching request:', notification);
      handleNewNotification({
        id: Date.now().toString(),
        title: notification,
        createdAt: new Date().toISOString(),
        read: false
      });
    });

    setSocket(socketInstance);

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      socketInstance.disconnect();
    };
  }, []); // Empty dependency array to run only once when component mounts

  // Xử lý thông báo mới
  const handleNewNotification = (notification: any) => {
    // Chuyển đổi notification từ string thành object nếu cần
    let formattedNotification: Notification;
    
    if (typeof notification === 'string') {
      formattedNotification = {
        id: Date.now().toString(),
        title: notification,
        createdAt: new Date().toISOString(),
        read: false
      };
    } else if (typeof notification === 'object') {
      formattedNotification = {
        id: notification.id || Date.now().toString(),
        title: notification.title || 'New notification',
        createdAt: notification.createdAt || new Date().toISOString(),
        read: false
      };
    } else {
      return; // Không xử lý nếu không đúng định dạng
    }

    setNotifications(prev => [formattedNotification, ...prev].slice(0, 20)); // Giữ tối đa 20 thông báo
    setUnreadCount(prev => prev + 1);
    
    // Hiển thị thông báo trên trình duyệt nếu được hỗ trợ
    if (Notification.permission === 'granted') {
      new Notification('ProjectGW Notification', {
        body: formattedNotification.title,
      });
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  // Đánh dấu một thông báo là đã đọc
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Toggle hiển thị thông báo
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setTimeout(() => markAllAsRead(), 2000); // Đánh dấu đã đọc sau khi mở 2s
    }
  };
  
  // Lấy thông tin người dùng từ localStorage khi component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    // Đầu tiên thử lấy userName từ localStorage
    const storedUserName = localStorage.getItem('userName');
    
    if (storedUserName) {
      setUserName(storedUserName);
    } else if (accessToken) {
      try {
        // Giải mã JWT để lấy thông tin nếu không có trong localStorage
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload.name) {
            setUserName(payload.name);
            // Lưu vào localStorage để lần sau không cần giải mã nữa
            localStorage.setItem('userName', payload.name);
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        // Nếu có lỗi, thiết lập userName mặc định
        setUserName("User");
      }
    }
  }, []);
  
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

  // Yêu cầu quyền thông báo
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Hàm tìm kiếm
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
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

  // Navigate to user profile page when a search result is clicked
  const viewUserProfile = (userId: string) => {
    if (!userId) {
      console.error('Invalid user ID');
      return;
    }
    
    // Close search results
    setSearchResults([]);
    
    // Clear search input
    setSearchTerm('');
    
    // Navigate to the user profile page
    router.push(`/user-profile/${userId}`);
    
    // Optionally track this interaction
    console.log(`Viewing profile for user: ${userId}`);
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
        {/* Notification Button */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="px-4 py-2 hover:bg-gray-50 text-gray-700 relative"
            onClick={toggleNotifications}
          >
            <span className="text-gray-700">Notification</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-20 max-h-96 overflow-auto">
              <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <h3 className="font-medium">Notifications</h3>
                <button 
                  onClick={markAllAsRead} 
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              </div>
              
              {notifications.length > 0 ? (
                <ul>
                  {notifications.map((notification) => (
                    <li 
                      key={notification.id} 
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start">
                        <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <p className="text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No notifications yet
                </div>
              )}
              
              {connectionStatus !== 'connected' && (
                <div className="p-2 text-center text-xs">
                  <span className={`inline-block w-3 h-3 rounded-full mr-1 ${
                    connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></span>
                  {connectionStatus === 'error' ? 'Connection error' : 'Disconnected'}
                </div>
              )}
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