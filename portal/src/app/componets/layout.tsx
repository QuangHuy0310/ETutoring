import Header from "./Header";
import React from "react";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <Header />

      {/* Wrapper chính để giữ nội dung + sidebar trái */}
      <div className="flex flex-1 pt-0">
        {/* Sidebar trái */}
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-7.125rem)] bg-gray-200 shadow-lg p-4 z-40 flex flex-col items-center justify-between">
          <div className="w-full">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gray-400 rounded-full flex items-center justify-center text-blue-600 font-semibold mb-4">
              Avatar
            </div>

            <nav className="space-y-4">
              {/* Link đến Blog */}
              <Link href="/">
                <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">
                  Blog
                </button>
              </Link>

              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">
                Message
              </button>
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">
                Dashboard
              </button>
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">
                Setting
              </button>
            </nav>
          </div>

          {/* Các button chờ dưới cùng */}
          <div className="w-full space-y-2">
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

        {/* Nội dung chính */}
        <main className="ml-64 flex-1 bg-black text-white">{children}</main>
      </div>

      {/* Footer */}
      <footer className="bg-white text-center py-2 text-gray-900 font-semibold">
        © 2025 ProjectGW. All Rights Reserved.
      </footer>
    </div>
  );
}
