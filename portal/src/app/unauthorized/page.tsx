"use client";
import React from 'react';
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-lg mb-4">
          You do not have permission to access this page. Please contact the administrator if you believe this is a mistake.
        </p>
        <p className="text-md text-gray-700 mb-6">
          Contact Admin: <br />
          Email: <a href="mailto:Admin@gmail.com" className="text-blue-600 underline">Admin@gmail.com</a> <br />
          Phone: <a href="tel:028123456789" className="text-blue-600 underline">028 123456789</a>
        </p>
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Go back to Home
        </Link>
      </div>
    </div>
  );
}