"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/app/componets/layout";
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaUserTag, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";

interface UserInfo {
  id?: string;
  userId?: string;
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

interface TokenInfo {
  userId: string;
  email: string;
  role?: string;
  name?: string;
}

export default function InformationViewPage() {
  return (
    <Layout>
      <Suspense fallback={<div className="text-white p-8">Loading user info...</div>}>
        <Content />
      </Suspense>
    </Layout>
  );
}

function Content() {
  const searchParams = useSearchParams();
  const idUser = searchParams.get('idUser');

  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!idUser) {
          setError("User ID not provided");
          setLoading(false);
          return;
        }

        const accessToken = getCookie('accessToken');
        if (!accessToken) {
          setError("Authentication required.");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3002/get-infors`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();

        let userInfo;

        if (data && data.data && Array.isArray(data.data)) {
          userInfo = data.data.find((user: any) =>
            user.userId === idUser || user._id === idUser || user.id === idUser
          );
        } else if (Array.isArray(data)) {
          userInfo = data.find((user: any) =>
            user.userId === idUser || user._id === idUser || user.id === idUser
          );
        } else if (typeof data === 'object') {
          if (data.userId === idUser || data._id === idUser || data.id === idUser) {
            userInfo = data;
          } else if (data.data && (data.data.userId === idUser || data.data._id === idUser || data.data.id === idUser)) {
            userInfo = data.data;
          }
        }

        if (userInfo) {
          setUserData({
            id: userInfo.id || userInfo._id || "",
            userId: userInfo.userId || "",
            name: userInfo.name || "User",
            email: userInfo.email || "",
            phoneNumber: userInfo.phone || userInfo.phoneNumber || "",
            major: userInfo.major || "",
            avatar: userInfo.avatar || "",
            role: userInfo.role || "User",
            address: userInfo.address || "",
            country: userInfo.country || "",
            description: userInfo.description || "",
          });
        } else {
          throw new Error("User information not found.");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setError("Failed to fetch user information.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [idUser]);

  const getInitialAvatar = () => {
    return userData?.name ? userData.name.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Error!</strong> <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-300">No user information available</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="w-full bg-black border border-gray-700 rounded-lg shadow-md relative overflow-visible mb-4">
        <div className="relative w-full h-56 bg-gray-700 rounded-t-lg overflow-hidden">
          <img src="/anh-bia-dep-cute-7.jpg.webp" alt="Banner" className="w-full h-full object-cover" />
        </div>

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
              <span className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300">{userData.role}</span>
              {userData.userId && (
                <span className="text-gray-400 text-xs py-1 px-2 bg-gray-800 bg-opacity-70 rounded">
                  ID: {userData.userId.substring(0, 8)}...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-1 gap-8 mt-16">
        <div className="max-w-3xl mx-auto w-full bg-black border border-gray-700 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">User Information</h3>
          </div>

          <div className="p-6 space-y-4">
            <InfoItem icon={<FaUser />} label="Full Name" value={userData.name || "Unknown"} />
            <InfoItem icon={<FaEnvelope />} label="Email Address" value={userData.email} />
            <InfoItem icon={<FaPhone />} label="Phone Number" value={userData.phoneNumber || "Not provided"} />
            <InfoItem icon={<FaGraduationCap />} label="Major" value={userData.major || "Not specified"} />
            <InfoItem icon={<FaUserTag />} label="Role" value={userData.role || "Unknown"} />
            {userData.address && (
              <InfoItem icon={<FaMapMarkerAlt />} label="Address" value={`${userData.address}, ${userData.country || ""}`} />
            )}
            {userData.description && (
              <InfoItem icon={<FaInfoCircle />} label="Description" value={userData.description} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center p-3 bg-gray-800 bg-opacity-40 rounded-lg">
      <div className="bg-blue-600 rounded-full p-2 mr-3">{icon}</div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white">{value}</p>
      </div>
    </div>
  );
}
