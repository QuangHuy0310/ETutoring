"use client";

import { useEffect, useState } from "react";
import Layout from "@/app/componets/layout";
import { FaEdit } from "react-icons/fa";
import InformationForm from "@/app/information/information-form";

// Định nghĩa interface cho dữ liệu người dùng
interface UserInfo {
  id?: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  major?: string;
  avatar?: string;
  role?: string;
}

// Định nghĩa component Timetable
function Timetable() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["8:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00", "17:00-19:00"];

  return (
    <table className="w-full border border-gray-600 text-center">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="border border-gray-600 p-2">Slot / Day</th>
          {days.map(day => <th key={day} className="border border-gray-600 p-2">{day}</th>)}
        </tr>
      </thead>
      <tbody>
        {slots.map((slot, i) => (
          <tr key={i} className="border border-gray-600">
            <td className="border border-gray-600 p-2 bg-gray-800 text-white">{slot}</td>
            {days.map((_, j) => <td key={j} className="border border-gray-600 p-2 bg-gray-700 text-gray-400">-</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function InformationPage() {
  // State cho thông tin người dùng
  const [userData, setUserData] = useState({
    id: "",
    name: "User",
    role: "User",
    email: "",
    phoneNumber: "",
    major: "",
    avatar: ""
  });
  
  // State cho UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 1. Lấy thông tin từ token
        const tokenInfo = decodeToken();
        if (!tokenInfo) {
          setError("Không thể lấy thông tin đăng nhập");
          setLoading(false);
          return;
        }

        // Cập nhật email và role từ token
        setUserData(prev => ({
          ...prev,
          email: tokenInfo.email,
          role: tokenInfo.role.charAt(0).toUpperCase() + tokenInfo.role.slice(1)
        }));

        // 2. Gọi API để lấy thông tin chi tiết
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch("http://localhost:3002/get-infors", {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        
        // 3. Xử lý dữ liệu từ API
        let userInfo = Array.isArray(data) 
          ? data.find(user => user.email === tokenInfo.email) 
          : data;
        
        // 4. Cập nhật state nếu tìm thấy thông tin
        if (userInfo) {
          setUserData(prev => ({
            ...prev,
            id: userInfo.id || userInfo._id || "", // Lưu ID từ API
            name: userInfo.name || prev.name,
            phoneNumber: userInfo.phoneNumber || prev.phoneNumber,
            major: userInfo.major || prev.major,
            avatar: userInfo.avatar || prev.avatar
          }));
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Hàm decode JWT token
  const decodeToken = () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return null;

      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));
      return {
        email: payload.email,
        role: payload.role
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Xử lý cập nhật thông tin người dùng
  const handleUpdateInfo = async (updatedData: { id: string; name: string; phoneNumber: string }) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      // Sử dụng API với query param id
      const response = await fetch(`http://localhost:3002/edit-infors?id=${updatedData.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: updatedData.name,
          email: userData.email,
          phoneNumber: updatedData.phoneNumber,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      // Cập nhật state với thông tin mới
      setUserData({
        ...userData,
        name: updatedData.name,
        phoneNumber: updatedData.phoneNumber
      });
      
      console.log("Information updated successfully!");
      
    } catch (error: any) {
      console.error("Error updating information:", error);
      throw error;
    }
  };

  // Helper function cho avatar
  const getInitialAvatar = () => {
    return userData.name.charAt(0).toUpperCase();
  };

  return (
    <Layout>
      <div className="flex flex-col p-0 w-full h-full">
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : (
          <>
            {/* Header */}
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
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white rounded-full overflow-hidden">
                    {userData.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.textContent = getInitialAvatar();
                        }}
                      />
                    ) : (
                      <div>{getInitialAvatar()}</div>
                    )}
                  </div>
                </div>
                <div className="ml-4 mb-4">
                  <h2 className="text-2xl font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded-md">
                    {userData.name}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    <span className="mr-2">{userData.email}</span>
                    <span className="bg-gray-800 text-xs px-2 py-1 rounded">{userData.role}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {/* User Information Section */}
              <div className="md:col-span-1 bg-black border border-gray-700 p-8 rounded-lg shadow-md text-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">User Information</h3>
                  {!showEditForm && (
                    <button 
                      onClick={() => setShowEditForm(true)}
                      className="p-2 rounded-full bg-blue-600 hover:opacity-80 transition-opacity"
                      title="Edit Information"
                    >
                      <FaEdit />
                    </button>
                  )}
                </div>

                {showEditForm ? (
                  // Sử dụng component InformationForm
                  <InformationForm 
                    userId={userData.id}
                    userName={userData.name}
                    userEmail={userData.email}
                    userPhone={userData.phoneNumber}
                    onUpdate={(updatedData) => handleUpdateInfo({
                      id: userData.id,
                      ...updatedData
                    })}
                    onCancel={() => setShowEditForm(false)}
                  />
                ) : (
                  // Display Information
                  <div className="space-y-5">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                      <div className="text-white text-lg">{userData.name}</div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Email Address</label>
                      <div className="text-white text-lg">{userData.email}</div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Phone Number</label>
                      <div className="text-white text-lg">{userData.phoneNumber || "Not provided"}</div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Major</label>
                      <div className="text-white text-lg">{userData.major || "Not specified"}</div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Role</label>
                      <div className="text-white text-lg">{userData.role}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timetable Section */}
              <div className="md:col-span-2 bg-black border border-gray-700 p-8 rounded-lg shadow-md text-white">
                <h3 className="text-lg font-semibold mb-4">Timetable</h3>
                <div className="overflow-x-auto">
                  <Timetable />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}