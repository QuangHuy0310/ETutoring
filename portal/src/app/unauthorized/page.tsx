"use client";
import React from 'react';
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access is denied</h1>
        <p className="text-lg mb-6">
          You do not have permission to access this page. Please contact the administrator if you believe this is an error.
        </p>
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Go back to homepage
        </Link>
      </div>
    </div>
  );
}