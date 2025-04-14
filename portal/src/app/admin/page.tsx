"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/admin/AdminLayout";
import { FaUsers, FaUniversity, FaBlog, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

// Interface cho dữ liệu thống kê
interface StatsData {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalFaculties: number;
  totalBlogs: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalStudents: 0,
    totalTutors: 0,
    totalFaculties: 0,
    totalBlogs: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const accessToken = getCookie('accessToken');
        if (!accessToken) {
          router.push('/login');
          return;
        }

        // Giải mã token để kiểm tra quyền admin
        const decoded = jwtDecode<{ role?: string }>(accessToken.toString());
        if (decoded.role !== 'admin') {
          router.push('/unauthorized');
          return;
        }

        // Gọi API để lấy thống kê
        const response = await fetch('http://localhost:3002/api/v1/admin/stats', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        
        // Cập nhật state với dữ liệu từ API
        setStats({
          totalUsers: data.totalUsers || 0,
          totalStudents: data.totalStudents || 0,
          totalTutors: data.totalTutors || 0,
          totalFaculties: data.totalFaculties || 0,
          totalBlogs: data.totalBlogs || 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  // Mảng các card thống kê
  const statCards = [
    { title: 'Total Users', count: stats.totalUsers, icon: <FaUsers className="text-3xl text-green-700" />, href: '/admin/mgr_users' },
    { title: 'Students', count: stats.totalStudents, icon: <FaUserGraduate className="text-3xl text-green-700" />, href: '/admin/mgr_students' },
    { title: 'Tutors', count: stats.totalTutors, icon: <FaChalkboardTeacher className="text-3xl text-green-700" />, href: '/admin/mgr_tutors' },
    { title: 'Faculties', count: stats.totalFaculties, icon: <FaUniversity className="text-3xl text-green-700" />, href: '/admin/mgr_faculties' },
    { title: 'Blog Posts', count: stats.totalBlogs, icon: <FaBlog className="text-3xl text-green-700" />, href: '/admin/mgr_blogs' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-800">Admin Dashboard</h1>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((card, index) => (
                <div 
                  key={index}
                  className="bg-white border border-green-100 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(card.href)}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">{card.title}</h3>
                        <p className="text-3xl font-bold text-green-700 mt-2">{card.count}</p>
                      </div>
                      <div className="p-3 bg-leaf-green rounded-lg">{card.icon}</div>
                    </div>
                  </div>
                  <div className="bg-green-600 h-1 w-full"></div>
                </div>
              ))}
            </div>

            {/* Recent Activity Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-green-800">Recent Activity</h2>
              <div className="bg-white border border-green-100 rounded-lg shadow p-4">
                <div className="border-b pb-2 mb-2">
                  <p className="text-gray-700">System is running normally. All services are operational.</p>
                  <span className="text-sm text-gray-500">Today, 10:45 AM</span>
                </div>
                <div className="border-b pb-2 mb-2">
                  <p className="text-gray-700">New user registered: John Doe</p>
                  <span className="text-sm text-gray-500">Yesterday, 2:30 PM</span>
                </div>
                <div>
                  <p className="text-gray-700">Backup completed successfully</p>
                  <span className="text-sm text-gray-500">Yesterday, 1:15 AM</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
