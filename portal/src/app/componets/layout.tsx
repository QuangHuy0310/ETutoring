"use client";

import Header from "./Header";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <Header />

      {/* Wrapper chính để giữ nội dung + sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar trái */}
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-8rem)] bg-gray-200 shadow-lg p-4 z-40 flex flex-col">
          <div className="flex-1">
            <nav className="space-y-4">
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">Home</button>
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">Message</button>
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">My Lesson</button>
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">Setting</button>
              <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">NEWNEW</button>
            </nav>
          </div>

          {/* Đặt hình ảnh ở dưới cùng */}
          <div className="w-full h-32 bg-gray-400 rounded-lg mt-auto"></div>
        </aside>

        {/* Nội dung chính */}
        <main className="ml-64 mr-64 flex-1 px-4 md:px-20 lg:px-72 pb-24 bg-black text-white">
          {children}
        </main>

        {/* Sidebar phải */}
        <aside className="fixed right-0 top-16 w-64 h-[calc(100vh-8rem)] bg-gray-200 shadow-lg p-4 z-40 flex flex-col">
          {/* Avatar */}
          <div className="flex items-center justify-center py-4">
            <div className="w-24 h-24 bg-gray-400 rounded-full flex items-center justify-center text-blue-600 font-bold">
              Avatar
            </div>
          </div>

          {/* Danh sách user */}
          <div className="flex-1 space-y-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="flex items-center bg-white rounded-lg p-2 shadow">
                <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center mr-3">
                  👤
                </div>
                <span className="text-gray-700 font-medium">User {index + 1}</span>
              </div>
            ))}
          </div>

          {/* Các button dưới cùng */}
          <div className="space-y-2 mt-auto">
            <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">Option 1</button>
            <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">Option 2</button>
            <button className="w-full py-2 bg-blue-500 text-white font-semibold rounded">Option 3</button>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white shadow-md py-4 px-6 relative z-50">
        <p className="text-center text-gray-400">© 2025 My Website</p>
      </footer>
    </div>
  );
}
