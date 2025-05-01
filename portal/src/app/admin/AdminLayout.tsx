"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUsers, FaUniversity, FaBlog, FaSignOutAlt, FaCog, FaChalkboardTeacher, FaChartBar } from "react-icons/fa";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Lấy thông tin admin từ cookie hoặc local storage
    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      router.push("/login");
    }

    // Đây chỉ là giả định, cần cập nhật theo cách lưu trữ thực tế
    const storedAdminName = localStorage.getItem("adminName");
    if (storedAdminName) {
      setAdminName(storedAdminName);
    }
  }, [router]);

  const handleLogout = () => {
    // Xóa cookie hoặc localStorage
    deleteCookie("accessToken");
    localStorage.removeItem("adminName");
    router.push("/login");
  };

  // Danh sách các mục menu
  const menuItems = [
    // { name: "Dashboard", icon: <FaChartBar />, path: "/admin" },
    { name: "User Management", icon: <FaUsers />, path: "/admin/mgr_users" },
    { name: "Faculty Management", icon: <FaUniversity />, path: "/admin/mgr_faculties" },
    { name: "Risk ", icon: <FaUniversity />, path: "/admin/mgr_risk" },
    // logout 
    { 
      name: "Logout", 
      icon: <FaSignOutAlt className="text-red-600" />, 
      path: "#", 
      onClick: handleLogout,
      className: "text-red-600 hover:bg-red-50"
    },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="flex h-screen bg-leaf-green">
      {/* Sidebar */}
      <div
        className={`h-full bg-white p-4 shadow-md transition-all duration-300 flex flex-col ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo và toggle */}
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-green-700">Admin Portal</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-leaf-green"
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.22 14.78a.75.75 0 001.06 0l3.5-3.5a.75.75 0 000-1.06l-3.5-3.5a.75.75 0 00-1.06 1.06L9.94 10l-2.72 2.72a.75.75 0 000 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Admin info - no avatar */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <p className={`font-medium text-gray-800 ${isCollapsed ? "text-center" : ""}`}>
            {isCollapsed ? "Admin" : `Welcome, ${adminName}`}
          </p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.onClick ? (
                  <div
                    onClick={item.onClick}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      item.className || (
                        isActive(item.path)
                          ? "bg-leaf-green text-green-700 font-medium"
                          : "hover:bg-leaf-green/50 hover:text-green-700 text-gray-700"
                      )
                    }`}
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                ) : (
                  <Link href={item.path}>
                    <div
                      className={`flex items-center p-3 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? "bg-leaf-green text-green-700 font-medium"
                          : "hover:bg-leaf-green/50 hover:text-green-700 text-gray-700"
                      }`}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
