"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/app/componets/layout";
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaUserTag, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";

// Định nghĩa interface cho dữ liệu người dùng
interface UserInfo {
  id?: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  major?: string;
  avatar?: string;
  role?: string;
  address?: string;
  country?: string;
  description?: string;
}

export default function InformationViewPage() {
  // State cho thông tin người dùng
  const [userData, setUserData] = useState<UserInfo | null>(null);
  
  // State cho UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy idUser từ query parameter
  const searchParams = useSearchParams();
  const idUser = searchParams.get('idUser');

  // Fetch user information
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!idUser) {
          setError("User ID not provided");
          setLoading(false);
          return;
        }

        // Get token for authentication
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        // Thay đổi API từ Push-Id sang get-infors
        // Fetch user information using the API with userId filter
        const response = await fetch(`http://localhost:3002/get-infors`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Process the API response
        let userInfo;

        // Kiểm tra nếu response có cấu trúc { data: [...] }
        if (data && data.data) {
          if (Array.isArray(data.data)) {
            // Tìm user với userId khớp với idUser từ parameter
            userInfo = data.data.find((user: any) => 
              user.userId === idUser || 
              user._id === idUser || 
              user.id === idUser
            );
          } else if (typeof data.data === 'object') {
            // Nếu data.data là một object đơn, kiểm tra xem có phải là user cần tìm không
            if (data.data.userId === idUser || data.data._id === idUser || data.data.id === idUser) {
              userInfo = data.data;
            }
          }
        } else {
          // Xử lý theo cách cũ nếu không có cấu trúc { data: [...] }
          if (Array.isArray(data)) {
            // Tìm user với userId khớp với idUser từ parameter
            userInfo = data.find(user => 
              user.userId === idUser || 
              user._id === idUser || 
              user.id === idUser
            );
          } else if (typeof data === 'object') {
            // Nếu API trả về một object đơn, kiểm tra xem có phải là user cần tìm không
            if (data.userId === idUser || data._id === idUser || data.id === idUser) {
              userInfo = data;
            }
          }
        }

        if (userInfo) {
          setUserData({
            id: userInfo.id || userInfo._id || "",
            name: userInfo.name || "User",
            email: userInfo.email || "",
            phoneNumber: userInfo.phone || userInfo.phoneNumber || "",
            major: userInfo.major || "",
            avatar: userInfo.avatar || "",
            role: userInfo.role || "User",
            address: userInfo.address || "",
            country: userInfo.country || "",
            description: userInfo.description || ""
          });
        } else {
          throw new Error("User information not found in API response");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setError("Failed to fetch user information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [idUser]);

  // Helper function for avatar
  const getInitialAvatar = () => {
    return userData?.name ? userData.name.charAt(0).toUpperCase() : 'U';
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
        ) : userData ? (
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
              <div className="flex items-end absolute left-8 -bottom-16">
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
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-gray-400 text-sm py-1 px-2 bg-gray-800 bg-opacity-70 rounded">
                      <FaEnvelope className="inline mr-1 text-xs" /> {userData.email}
                    </span>
                    <span className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300">
                      {userData.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-1 gap-8 mt-16">
              {/* User Information Card */}
              <div className="max-w-3xl mx-auto w-full bg-black border border-gray-700 rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">User Information</h3>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                      <div className="bg-blue-600 rounded-full p-2 mr-3">
                        <FaUser className="text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Full Name</p>
                        <p className="text-white">{userData.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                      <div className="bg-green-600 rounded-full p-2 mr-3">
                        <FaEnvelope className="text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Email Address</p>
                        <p className="text-white">{userData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                      <div className="bg-yellow-600 rounded-full p-2 mr-3">
                        <FaPhone className="text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Phone Number</p>
                        <p className="text-white">{userData.phoneNumber || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                      <div className="bg-purple-600 rounded-full p-2 mr-3">
                        <FaGraduationCap className="text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Major</p>
                        <p className="text-white">{userData.major || "Not specified"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                      <div className="bg-red-600 rounded-full p-2 mr-3">
                        <FaUserTag className="text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Role</p>
                        <p className="text-white">{userData.role}</p>
                      </div>
                    </div>
                    
                    {userData.address && (
                      <div className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                        <div className="bg-indigo-600 rounded-full p-2 mr-3">
                          <FaMapMarkerAlt className="text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Address</p>
                          <p className="text-white">{userData.address}</p>
                          {userData.country && <p className="text-gray-400 text-sm">{userData.country}</p>}
                        </div>
                      </div>
                    )}
                    
                    {userData.description && (
                      <div className="flex items-start p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                        <div className="bg-teal-600 rounded-full p-2 mr-3 mt-1">
                          <FaInfoCircle className="text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Description</p>
                          <p className="text-white">{userData.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-64 bg-black bg-opacity-50 rounded-lg">
            <p className="text-gray-300">No user information available</p>
          </div>
        )}
      </div>
    </Layout>
  );
}