"use client";

import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="w-full bg-white shadow-md py-4 px-6 fixed top-0 left-0 right-0 z-50">
        <h1 className="text-xl font-bold">Header</h1>
      </header>

      {/* Sidebar trái */}
      <aside className="fixed left-0 top-16 w-64 h-screen bg-gray-200 shadow-lg p-4 z-40">
        <h2 className="text-lg font-semibold">Left Sidebar</h2>
        <p className="text-gray-600">Menu items...</p>
      </aside>

      {/* Sidebar phải */}
      <aside className="fixed right-0 top-16 w-64 h-screen bg-gray-200 shadow-lg p-4 z-40">
        <h2 className="text-lg font-semibold">Right Sidebar</h2>
        <p className="text-gray-600">Additional info...</p>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 mt-16 px-4 md:px-20 lg:px-72">{children}</main>

      {/* Footer */}
      <footer className="w-full bg-white shadow-md py-4 px-6 mt-6 relative z-50">
        <p className="text-center text-gray-600">© 2025 My Website</p>
      </footer>
    </div>
  );
}
