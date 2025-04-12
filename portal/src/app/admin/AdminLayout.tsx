"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import Header from "@/app/componets/Header_for_ad";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra token và role khi component được tải
  useEffect(() => {
    const checkAuth = () => {
      const token = getCookie('accessToken');
      
      if (!token) {
        // Nếu không có token, chuyển hướng về trang login
        router.push('/login');
        return;
      }

      try {
        // Giải mã token để kiểm tra role
        const tokenParts = token.toString().split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Kiểm tra nếu token hết hạn
        if (payload.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }

        // Kiểm tra role
        if (payload.role !== 'admin') {
          router.push('/unauthorized');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Hiển thị loading spinner khi đang kiểm tra xác thực
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Không hiển thị gì cả khi người dùng không có quyền (để tránh flash of content)
  if (!isAuthorized) {
    return null;
  }

  // Hiển thị layout khi đã xác thực thành công
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header with toggleSidebar function */}
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 relative">
        {/* Sidebar - conditionally rendered based on state */}
        <aside 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transform transition-transform duration-300 ease-in-out fixed md:static z-20 w-64 bg-gray-800 p-4 flex flex-col items-center h-[calc(100vh-theme(spacing.16))]`}
        >
          <div className="w-24 h-24 bg-gray-600 rounded-full mb-4"></div>
          <p className="text-lg font-semibold mb-6">Avatar</p>
          <nav className="w-full">
            <button
              className="w-full py-2 mb-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => router.push("/admin")}
            >
              Dashboard
            </button>
            <button
              className="w-full py-2 mb-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => router.push("/admin/mgr_account")}
            >
              Account Manager
            </button>
            <button
              className="w-full py-2 mb-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => router.push("/admin/mgr_faculties")}
            >
              Manager Faculties
            </button>
            <button
              className="w-full py-2 mb-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => router.push("/admin/mgr_risk")}
            >
              Manager Risk
            </button>
          </nav>
        </aside>

        {/* Main content - adjusts padding when sidebar is closed */}
        <main className={`flex-1 p-6 ${!sidebarOpen ? 'pl-4' : ''} bg-gray-900`}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white text-center py-2 text-gray-900 font-semibold">
        © 2025 ProjectGW. All Rights Reserved.
      </footer>
    </div>
  );
};

export default AdminLayout;
