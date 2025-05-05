"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaLayerGroup } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserStats {
  total: number;
  students: number;
  tutors: number;
  staff: number;
  admins: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function Dashboard() {
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    students: 0,
    tutors: 0,
    staff: 0,
    admins: 0,
  });
  const [majorCount, setMajorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = getCookie("accessToken");
        
        if (!token) {
          toast.error("Authentication error. Please login again.");
          setIsLoading(false);
          return;
        }

        // Fetch users and calculate statistics
        const usersResponse = await axios.get(`${API_URL}/api/v1/users/get-all-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        // Process user data
        let userData = usersResponse.data;
        if (userData.data) userData = userData.data;
        else if (userData.users) userData = userData.users;
        else if (userData.result) userData = userData.result;

        if (Array.isArray(userData)) {
          const stats: UserStats = {
            total: userData.length,
            students: 0,
            tutors: 0,
            staff: 0,
            admins: 0,
          };

          // Count users by role
          userData.forEach((user: any) => {
            const role = user.role?.toLowerCase() || "";
            if (role === "user") stats.students++;
            else if (role === "tutor") stats.tutors++;
            else if (role === "staff") stats.staff++;
            else if (role === "admin") stats.admins++;
          });

          setUserStats(stats);
        }

        // Fetch majors count
        const majorsResponse = await axios.get(`${API_URL}/get-major`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (majorsResponse.data && Array.isArray(majorsResponse.data.data)) {
          setMajorCount(majorsResponse.data.data.length);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, count, icon }: { title: string, count: number, icon: React.ReactNode }) => (
    <div className="rounded-xl border border-green-500 bg-white shadow-sm p-6 flex flex-col justify-between min-h-[110px] min-w-[220px] relative mb-2"
      style={{ fontFamily: 'Inter, Roboto, sans-serif' }}>
      <div className="flex items-center w-full justify-between">
        <div>
          <p className="text-base font-semibold text-gray-700">{title}</p>
          <h3 className="text-3xl font-bold text-green-700 mt-1">{count}</h3>
        </div>
        <div className="text-4xl text-green-400 bg-green-50 rounded-lg p-2">{icon}</div>
      </div>
      <div className="absolute left-0 bottom-0 w-full h-1 bg-green-500 rounded-b-xl" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-white font-sans">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-green-800" style={{fontFamily:'Inter,Roboto,sans-serif'}}>Admin Dashboard</h1>
        <span className="text-sm text-gray-500 mt-1">{today}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          count={userStats.total}
          icon={<FaUsers />}
        />
        <StatCard
          title="Students"
          count={userStats.students}
          icon={<FaUserGraduate />}
        />
        <StatCard
          title="Tutors"
          count={userStats.tutors}
          icon={<FaChalkboardTeacher />}
        />
        <StatCard
          title="Faculties"
          count={majorCount}
          icon={<FaLayerGroup />}
        />
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}