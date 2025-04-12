"use client";
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getCookie, deleteCookie } from 'cookies-next';

export default function DebugToken() {
  const [tokenData, setTokenData] = useState<any>(null);
  const [cookies, setCookies] = useState<Record<string, string>>({});

  useEffect(() => {
    // Lấy tất cả các cookie
    const getAllCookies = () => {
      const cookieList: Record<string, string> = {};
      if (document.cookie) {
        document.cookie.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          cookieList[name] = value;
        });
      }
      setCookies(cookieList);
    };

    // Phân tích token
    const accessToken = getCookie('accessToken');
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken.toString());
        setTokenData(decoded);
      } catch (error) {
        console.error('Lỗi khi giải mã token:', error);
        setTokenData({ error: 'Token không hợp lệ hoặc bị hỏng' });
      }
    }

    getAllCookies();
  }, []);

  const clearToken = () => {
    deleteCookie('accessToken', { path: '/' });
    deleteCookie('userId', { path: '/' });
    deleteCookie('userEmail', { path: '/' });
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug AccessToken</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Token Information</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            {tokenData ? (
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(tokenData, null, 2)}
              </pre>
            ) : (
              <p>Không tìm thấy accessToken</p>
            )}
          </div>
          
          <button 
            onClick={clearToken}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Xóa Token
          </button>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">All Cookies</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(cookies, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Storage Information</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="mb-2 font-medium">Để xem tất cả localStorage và sessionStorage, hãy mở Console và chạy:</p>
          <pre className="bg-gray-200 p-2 rounded">
            {`console.log('localStorage:', { ...localStorage });
console.log('sessionStorage:', { ...sessionStorage });`}
          </pre>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin thêm</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>
            Nếu bạn thấy token mà không đăng nhập, đây có thể là do:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>Cookie từ phiên đăng nhập trước đó chưa hết hạn</li>
            <li>Chức năng Ghi nhớ đăng nhập đang hoạt động</li>
            <li>Có code ở đâu đó tự động tạo token trong quá trình phát triển</li>
            <li>Có xung đột giữa môi trường dev và production</li>
          </ul>
        </div>
      </div>
    </div>
  );
}