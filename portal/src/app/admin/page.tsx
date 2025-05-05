"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/admin/AdminLayout";
import Dashboard from "./Dashboard";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateAdmin = async () => {
      try {
        const accessToken = getCookie('accessToken');
        if (!accessToken) {
          router.push('/login');
          return;
        }

        // Validate admin role
        const decoded = jwtDecode<{ role?: string }>(accessToken.toString());
        if (decoded.role !== 'admin') {
          router.push('/unauthorized');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error validating admin access:', error);
        toast.error("Authentication error");
        router.push('/login');
      }
    };

    validateAdmin();
  }, [router]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Dashboard />
      <ToastContainer position="bottom-right" />
    </AdminLayout>
  );
};

export default AdminDashboard;
