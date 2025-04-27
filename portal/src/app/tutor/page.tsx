"use client";

import { useEffect, useState } from "react";
import Layout from "@/app/componets/layout";
import { FaEdit, FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaUserTag, FaDoorOpen, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";
import InformationForm from "@/app/information/information-form";
import Timetable from "@/app/information/timetable";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

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
  roomId?: string;
}

// Định nghĩa interface cho thông tin từ token
interface DecodedToken {
  email: string;
  role?: string;
  userId?: string;
  sub?: string;
  id?: string;
  iat: number;
  exp: number;
}

export default function TutorPage() {
  // State cho thông tin người dùng
  const [userData, setUserData] = useState<UserInfo>({
    id: "",
    name: "User",
    role: "Tutor",
    email: "",
    phoneNumber: "",
    major: "",
    avatar: "",
    roomId: ""
  });
  
  // State để lưu email từ token
  const [tokenEmail, setTokenEmail] = useState<string>("");
  
  // State cho UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Hàm decode JWT token
  const decodeToken = () => {
    try {
      if (typeof window === 'undefined') return null; // Check for server-side rendering
      
      const accessToken = getCookie('accessToken');
      if (!accessToken) return null;

      const decodedToken = jwtDecode<DecodedToken>(accessToken.toString());
      return {
        email: decodedToken.email,
        role: decodedToken.role,
        userId: decodedToken.userId || decodedToken.id || decodedToken.sub // Extract userId from different possible token formats
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch user information
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        // Get token and decode it (for authentication only)
        const accessToken = getCookie('accessToken');
        const tokenInfo = decodeToken();
        
        if (!accessToken || !tokenInfo) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        // Lưu email từ token vào state
        if (tokenInfo.email) {
          setTokenEmail(tokenInfo.email);
        }

        // Fetch detailed user information from API
        const response = await fetch("http://localhost:3002/get-infors", {
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
            // Nếu data.data là một mảng, tìm user phù hợp
            userInfo = data.data.find((user: { email: string }) => user.email === tokenInfo.email);
            
            if (!userInfo) {
              // Thử tìm theo userId nếu không tìm thấy theo email
              userInfo = data.data.find((user: { userId?: string; _id?: string; email: string }) => 
                user.userId === tokenInfo.userId || 
                user._id === tokenInfo.userId
              );
            }
          } else if (typeof data.data === 'object') {
            // Nếu data.data là một object đơn
            userInfo = data.data;
          }
        } else {
          // Xử lý theo cách cũ nếu không có cấu trúc { data: [...] }
          if (Array.isArray(data)) {
            // If API returns an array of users, find the matching one by email from token
            userInfo = data.find(user => user.email === tokenInfo.email);
            
            if (!userInfo) {
              // Try finding by user ID if email match fails
              userInfo = data.find(user => 
                user.id === tokenInfo.userId || 
                user._id === tokenInfo.userId
              );
            }
          } else if (typeof data === 'object') {
            // If API returns a single user object
            userInfo = data;
          }
        }

        if (userInfo) {
          // Use only the data from API response, not from token
          setUserData({
            id: userInfo.id || userInfo._id || "",
            name: userInfo.name || "User",
            email: userInfo.email || tokenInfo.email, // Fallback to token email if API doesn't provide it
            phoneNumber: userInfo.phone || userInfo.phoneNumber || "", 
            major: userInfo.major || "",
            avatar: userInfo.avatar || "",
            role: userInfo.role || (tokenInfo.role ? tokenInfo.role.charAt(0).toUpperCase() + tokenInfo.role.slice(1) : "User"),
            address: userInfo.address || "",
            country: userInfo.country || "",
            roomId: userInfo.roomId || ""
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
  }, []);

  // Update user information
  const handleUpdateInfo = async (updatedData: { 
    name: string; 
    phoneNumber: string; 
    email: string;
    major?: string;
    address?: string;
    country?: string;
  }) => {
    try {
      if (typeof window === 'undefined') return;
      
      const accessToken = getCookie('accessToken');
      const tokenInfo = decodeToken();
      
      if (!accessToken || !tokenInfo) {
        throw new Error("Authentication required. Please log in.");
      }
      
      // Sử dụng userId từ JWT token thay vì từ userData
      const userId = tokenInfo.userId;
      
      if (!userId) {
        throw new Error("User ID not found in token");
      }
      
      // Call API to update user information
      const response = await fetch(`http://localhost:3002/edit-infor?userId=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: updatedData.name,
          email: updatedData.email,
          phone: updatedData.phoneNumber,
          address: updatedData.address || "",
          major: updatedData.major || "",
          country: updatedData.country || ""
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Update failed with status: ${response.status}`);
      }
      
      // After successful update, fetch the updated info from API again
      const updatedResponse = await fetch("http://localhost:3002/get-infors", {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        let updatedUserInfo;
        
        // Kiểm tra cấu trúc response { data: [...] }
        if (updatedData && updatedData.data) {
          if (Array.isArray(updatedData.data)) {
            // Tìm user theo userId từ token thay vì id từ userData
            updatedUserInfo = updatedData.data.find((user: { userId?: string; _id?: string; id?: string }) => 
              user.userId === userId || user._id === userId || user.id === userId
            );
          } else if (typeof updatedData.data === 'object') {
            updatedUserInfo = updatedData.data;
          }
        } else {
          // Xử lý theo cách cũ
          if (Array.isArray(updatedData)) {
            // Tìm user theo userId từ token thay vì id từ userData
            updatedUserInfo = updatedData.find(user => 
              user.userId === userId || user._id === userId || user.id === userId
            );
          } else if (typeof updatedData === 'object') {
            updatedUserInfo = updatedData;
          }
        }
        
        if (updatedUserInfo) {
          setUserData(prev => ({
            ...prev,
            name: updatedUserInfo.name || prev.name,
            email: updatedUserInfo.email || prev.email,
            phoneNumber: updatedUserInfo.phone || prev.phoneNumber,
            major: updatedUserInfo.major || prev.major,
            address: updatedUserInfo.address || prev.address,
            country: updatedUserInfo.country || prev.country,
            roomId: updatedUserInfo.roomId || prev.roomId
          }));
        }
      } else {
        // If we can't fetch updated data, at least update local state
        setUserData(prev => ({
          ...prev,
          name: updatedData.name,
          email: updatedData.email,
          phoneNumber: updatedData.phoneNumber,
          major: updatedData.major || prev.major,
          address: updatedData.address || prev.address,
          country: updatedData.country || prev.country
        }));
      }
      
      // Close the edit form
      setShowEditForm(false);
    } catch (error: any) {
      console.error("Error updating information:", error);
      throw error;
    }
  };

  // Helper function for avatar
  const getInitialAvatar = () => {
    return userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Tutor Information Panel</h1>
          <p className="text-gray-400">Manage your profile and schedule</p>
        </div>

        {/* Main Content */}
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
            <div className="flex flex-col md:flex-row gap-8">
              {/* User Information Section */}
              <div className="md:w-1/3">
                <div className="bg-black border border-gray-700 rounded-lg shadow-md overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Tutor Information</h3>
                    {!showEditForm && (
                      <button 
                        onClick={() => setShowEditForm(true)}
                        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                        title="Edit Information"
                      >
                        <FaEdit className="text-white" />
                      </button>
                    )}
                  </div>
                  
                  {/* Avatar */}
                  <div className="flex justify-center py-6">
                    <div className="w-32 h-32 bg-gray-600 rounded-full">
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
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    {showEditForm ? (
                      <InformationForm 
                        userName={userData.name || ""}
                        userEmail={userData.email}
                        userPhone={userData.phoneNumber || ""}
                        userMajor={userData.major || ""}
                        userAddress={userData.address || ""}
                        userCountry={userData.country || ""}
                        onUpdate={handleUpdateInfo}
                        onCancel={() => setShowEditForm(false)}
                      />
                    ) : (
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
                            {tokenEmail && userData.email !== tokenEmail && (
                              <p className="text-gray-400 text-xs mt-1">
                                Token Email: {tokenEmail}
                              </p>
                            )}
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
                            <p className="text-gray-400 text-xs">Major/Specialization</p>
                            <p className="text-white">{userData.major || "Not specified"}</p>
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
                            </div>
                          </div>
                        )}
                        
                        {userData.country && (
                          <div className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                            <div className="bg-teal-600 rounded-full p-2 mr-3">
                              <FaGlobe className="text-white" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Country</p>
                              <p className="text-white">{userData.country}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                          <div className="bg-red-600 rounded-full p-2 mr-3">
                            <FaUserTag className="text-white" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Role</p>
                            <p className="text-white">{userData.role}</p>
                          </div>
                        </div>
                        
                        {userData.roomId && (
                          <div className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                            <div className="bg-amber-600 rounded-full p-2 mr-3">
                              <FaDoorOpen className="text-white" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Room ID</p>
                              <p className="text-white">{userData.roomId}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timetable Section */}
              <div className="md:w-2/3 bg-black border border-gray-700 p-8 rounded-lg shadow-md text-white">
                <h3 className="text-lg font-semibold mb-4">Timetable</h3>
                <Timetable />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}