"use client";
import Header from "./Header_for_user";
import React from "react";
import { useRouter } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header cố định */}
      <div className="h-16 shrink-0 z-50">
        <Header />
      </div>

      {/* Khu vực nội dung chính */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar bên trái */}
        <aside className="w-64 bg-gray-200 shadow-lg p-4 flex flex-col justify-between">
          <div>
            <div className="w-24 h-24 bg-gray-400 rounded-full flex items-center justify-center text-blue-600 font-semibold mb-4 mx-auto">
              Avatar
            </div>

            <nav className="space-y-4">
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded" onClick={() => router.push("/")}>
                Blog
              </button>
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded" onClick={() => router.push("/chatbox")}>
                Message
              </button>
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded" onClick={() => router.push("/dashboard")}>
                Dashboard
              </button>
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded" onClick={() => router.push("/settings")}>
                Setting
              </button>
            </nav>
          </div>

          {/* Các button pending bên dưới */}
          <div className="space-y-2">
            <button className="w-full py-2 bg-gray-500 text-white font-semibold rounded">
              Pending 1
            </button>
            <button className="w-full py-2 bg-gray-500 text-white font-semibold rounded">
              Pending 2
            </button>
            <button className="w-full py-2 bg-gray-500 text-white font-semibold rounded">
              Pending 3
            </button>
          </div>
        </aside>

        {/* Khu vực cuộn được */}
        <main className="flex-1 overflow-y-auto bg-black text-white p-4">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="h-10 shrink-0 bg-white text-center py-2 text-gray-900 font-semibold">
        © 2025 ProjectGW. All Rights Reserved.
      </footer>
    </div>
  );
}
