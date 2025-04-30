"use client";

import { useEffect, useState } from "react";
import Layout from "@/app/componets/layout";
import { FaEdit, FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaUserTag, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";
import InformationForm from "@/app/information/information-form";
import Timetable from "@/app/information/timetable";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

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
  roomId?: string; // vẫn giữ trong object nếu sau này cần
}

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
  const [tokenEmail, setTokenEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const decodeToken = () => {
    try {
      if (typeof window === "undefined") return null;
      const accessToken = getCookie("accessToken");
      if (!accessToken) return null;
      const decodedToken = jwtDecode<DecodedToken>(accessToken.toString());
      return {
        email: decodedToken.email,
        role: decodedToken.role,
        userId: decodedToken.userId || decodedToken.id || decodedToken.sub,
        id: decodedToken.id,
        sub: decodedToken.sub
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (typeof window === "undefined") return;
        const accessToken = getCookie("accessToken");
        const tokenInfo = decodeToken();
        if (!accessToken || !tokenInfo) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        if (tokenInfo.email) setTokenEmail(tokenInfo.email);

        const response = await fetch("http://localhost:3002/get-infors", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        let userInfo;

        if (data?.data) {
          userInfo = Array.isArray(data.data)
            ? data.data.find((user: { email: string; userId?: string }) => user.email === tokenInfo.email || user.userId === tokenInfo.userId)
            : data.data;
        } else {
          userInfo = Array.isArray(data)
            ? data.find(user => user.email === tokenInfo.email || user.userId === tokenInfo.userId)
            : data;
        }

        if (userInfo) {
          setUserData({
            id: userInfo.id || userInfo._id || "",
            name: userInfo.name || "User",
            email: userInfo.email || tokenInfo.email,
            phoneNumber: userInfo.phone || userInfo.phoneNumber || "",
            major: userInfo.major || "",
            avatar: userInfo.avatar || "",
            role: userInfo.role || "User",
            address: userInfo.address || "",
            country: userInfo.country || "",
            roomId: userInfo.roomId || ""
          });
        } else {
          console.log("Tutor information not found. Creating new tutor profile...");

          try {
            // Thay đổi đoạn code tạo hồ sơ người dùng mới
            const userId = tokenInfo.userId || tokenInfo.id || tokenInfo.sub;

            const createResponse = await fetch("http://localhost:3002/new-Information", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
              },
              body: JSON.stringify({
                email: tokenInfo.email,
                name: "User", 
                phone: "0000000000", // Sử dụng số điện thoại mẫu hợp lệ
                address: "Not specified", // Sử dụng chuỗi có giá trị thay vì chuỗi rỗng
                major: "Not specified",   // Sử dụng chuỗi có giá trị thay vì chuỗi rỗng
                country: "Not specified",
                path: "Not specified" , 
              })
            });

            if (!createResponse.ok) {
              const errorText = await createResponse.text().catch(() => "Unknown error");
              console.error(`Failed to create tutor profile: Status ${createResponse.status}, Details:`, errorText);

              // Thử phương án B nếu phương án A thất bại
              console.log("Trying alternative approach...");
              const retryResponse = await fetch("http://localhost:3002/new-Information", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                  email: tokenInfo.email,
                  userId: userId,
                  // Chỉ gửi các trường tối thiểu
                  name: "User",
                  phone: "0123456789"
                })
              });

              if (!retryResponse.ok) {
                const retryErrorText = await retryResponse.text().catch(() => "Unknown retry error");
                console.error(`Second attempt failed: Status ${retryResponse.status}, Details:`, retryErrorText);
                throw new Error(`Failed to create user profile after multiple attempts`);
              }

              const newUserData = await retryResponse.json();
              // Xử lý dữ liệu từ phương án B
              setUserData({
                id: newUserData.id || newUserData._id || "",
                name: newUserData.name || "User",
                email: tokenInfo.email,
                phoneNumber: newUserData.phone || newUserData.phoneNumber || "",
                major: newUserData.major || "",
                avatar: newUserData.avatar || "",
                role: tokenInfo.role ? tokenInfo.role.charAt(0).toUpperCase() + tokenInfo.role.slice(1) : "Tutor",
                address: newUserData.address || "",
                country: newUserData.country || "",
                roomId: newUserData.roomId || ""
              });

              console.log("New user profile created successfully with alternative approach");
              return; // Thoát khỏi hàm nếu phương án B thành công
            }

            const newUserData = await createResponse.json();

            // Cập nhật state với thông tin người dùng mới (phương án A thành công)
            setUserData({
              id: newUserData.id || newUserData._id || "",
              name: newUserData.name || "User",
              email: tokenInfo.email,
              phoneNumber: newUserData.phone || newUserData.phoneNumber || "",
              major: newUserData.major || "",
              avatar: newUserData.avatar || "",
              role: tokenInfo.role ? tokenInfo.role.charAt(0).toUpperCase() + tokenInfo.role.slice(1) : "Tutor",
              address: newUserData.address || "",
              country: newUserData.country || "",
              roomId: newUserData.roomId || ""
            });

            console.log("New tutor profile created successfully");
          } catch (createError) {
            console.error("Error creating new tutor profile:", createError);
            setError("Unable to create tutor profile. Please contact support.");
          }
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

  const handleUpdateInfo = async (updatedData: {
    name: string;
    phoneNumber: string;
    email: string;
    major?: string;
    address?: string;
    country?: string;
  }) => {
    try {
      const accessToken = getCookie("accessToken");
      const tokenInfo = decodeToken();
      if (!accessToken || !tokenInfo) throw new Error("Authentication required.");

      const userId = tokenInfo.userId;
      if (!userId) throw new Error("User ID not found in token");

      const response = await fetch(`http://localhost:3002/edit-infor?userId=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
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
        throw new Error(errorData?.message || `Update failed: ${response.status}`);
      }

      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating info:", error);
      throw error;
    }
  };

  const getInitialAvatar = () => userData.name ? userData.name.charAt(0).toUpperCase() : "U";

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Tutor Information Panel</h1>
          <p className="text-gray-400">Manage your profile and schedule</p>
        </div>

        <div className="flex flex-col p-0 w-full h-full">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error!</strong> {error}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              {/* User Information */}
              <div className="md:w-1/3">
                <div className="bg-black border border-gray-700 rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Tutor Information</h3>
                    {!showEditForm && (
                      <button onClick={() => setShowEditForm(true)} className="p-2 rounded-full bg-blue-600 hover:bg-blue-700">
                        <FaEdit className="text-white" />
                      </button>
                    )}
                  </div>

                  <div className="flex justify-center py-6">
                    <div className="w-32 h-32 bg-gray-600 rounded-full overflow-hidden flex justify-center items-center text-4xl font-bold text-white">
                      {userData.avatar ? (
                        <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div>{getInitialAvatar()}</div>
                      )}
                    </div>
                  </div>

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
                        {[
                          { icon: <FaUser />, label: "Full Name", value: userData.name },
                          { icon: <FaEnvelope />, label: "Email Address", value: userData.email },
                          { icon: <FaPhone />, label: "Phone Number", value: userData.phoneNumber || "Not provided" },
                          { icon: <FaGraduationCap />, label: "Major/Specialization", value: userData.major || "Not specified" },
                          { icon: <FaMapMarkerAlt />, label: "Address", value: userData.address },
                          { icon: <FaGlobe />, label: "Country", value: userData.country },
                          { icon: <FaUserTag />, label: "Role", value: userData.role }
                        ].map((info, idx) => (
                          info.value && (
                            <div key={idx} className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
                              <div className="rounded-full p-2 mr-3 bg-blue-600">{info.icon}</div>
                              <div>
                                <p className="text-gray-400 text-xs">{info.label}</p>
                                <p className="text-white">{info.value}</p>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timetable */}
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
