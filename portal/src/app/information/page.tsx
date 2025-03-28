"use client";

import { useEffect, useState } from "react";
import InformationForm from "@/app/information/information-form";
import Layout from "@/app/componets/layout";

// Định nghĩa component Timetable riêng biệt
function Timetable() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = [
    "8:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00",
    "17:00-19:00"
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-600 text-center">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border border-gray-600 p-2">Slot / Day</th>
            {days.map((day) => (
              <th key={day} className="border border-gray-600 p-2">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot, i) => (
            <tr key={i} className="border border-gray-600">
              <td className="border border-gray-600 p-2 bg-gray-800 text-white">{slot}</td>
              {days.map((day, j) => (
                <td key={j} className="border border-gray-600 p-2 bg-gray-700 text-gray-400">-</td>
              ))} 
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function InformationPage() {
  const [userName, setUserName] = useState<string>("User Name");
  const [userRole, setUserRole] = useState<string>("Student / Tutor");

  useEffect(() => {
    // Lấy và giải mã thông tin từ accessToken trong localStorage
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        // Giải mã JWT để lấy thông tin
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // Cập nhật state với thông tin từ token
          if (payload.name) {
            setUserName(payload.name);
          }
          
          if (payload.role) {
            // Hiển thị role với chữ cái đầu viết hoa
            const formattedRole = payload.role.charAt(0).toUpperCase() + payload.role.slice(1);
            setUserRole(formattedRole);
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  return (
    <Layout>
      <div className="flex flex-col p-0 w-full h-full">
        {/* Header của Information Page */}
        <div className="w-full bg-black border border-gray-700 rounded-lg shadow-md relative overflow-visible mb-4">
          {/* Banner */}
          <div className="relative w-full h-56 bg-gray-700 rounded-t-lg overflow-hidden">
            <img
              src="/anh-bia-dep-cute-7.jpg.webp"
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Avatar & User Info */}
          <div className="flex items-end absolute left-0 -bottom-16">
            <div className="w-32 h-32 bg-gray-500 rounded-full border-4 border-black shadow-lg">
              {/* Avatar có thể là chữ cái đầu của tên người dùng nếu không có ảnh */}
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white rounded-full overflow-hidden">
                <img
                  src="/placeholder-avatar.jpg"
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.textContent = userName.charAt(0).toUpperCase();
                  }}
                />
              </div>
            </div>
            <div className="ml-4 mb-4">
              <h2 className="text-2xl font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded-md">
                {userName}
              </h2>
              <p className="text-gray-400 text-sm">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 w-full grid grid-cols-3 gap-8 mt-16">
          {/* Form Section */}
          <div className="col-span-1 bg-black border border-gray-700 p-8 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold mb-4">{userRole} Information</h3>
            <InformationForm />
          </div>

          {/* Timetable Section */}
          <div className="col-span-2 bg-black border border-gray-700 p-8 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold mb-4">Timetable</h3>
            <Timetable />
          </div>
        </div>
      </div>
    </Layout>
  );
}