"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/componets/Header_for_ad";

const StaffLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter(); // Hook điều hướng

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 p-4 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-600 rounded-full mb-4"></div>
          <p className="text-lg font-semibold mb-6">Avatar</p>
          <nav className="w-full">
            <button
              className="w-full py-2 mb-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => router.push("/staff")}
            >
              Dashboard
            </button>
            <button
              className="w-full py-2 mb-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => router.push("/staff/listofuser")}
            >
              List of User
            </button>
            <button
              className="w-full py-2 mb-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => router.push("/staff/matching")}
            >
              Matching Page
            </button>
            <button
              className="w-full py-2 mb-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => router.push("/staff/managerblog")}
            >
              Manager Blog
            </button>
            <button
              className="w-full py-2 mb-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => router.push("/staff/managermatching")}
            >
              Manager Matching
            </button>
          </nav>
        </aside>

        {/* Nội dung chính */}
        <main className="flex-1 p-6 bg-gray-900">{children}</main>
      </div>

      {/* Footer */}
      <footer className="bg-white text-center py-2 text-gray-900 font-semibold">
        © 2025 ProjectGW. All Rights Reserved.
      </footer>
    </div>
  );
};

export default StaffLayout;
