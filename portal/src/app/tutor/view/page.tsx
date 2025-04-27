"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/app/componets/layout";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { getCookie } from "cookies-next";

interface UserInfo {
  id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  description?: string;
  avatar?: string;
}

export default function ViewTutorPage() {
  const searchParams = useSearchParams();
  const idUser = searchParams.get("idUser");

  const [tutorData, setTutorData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorInfo = async () => {
      try {
        const accessToken = getCookie("accessToken");
        if (!accessToken || !idUser) {
          setError("Authentication failed or user ID missing.");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:3002/get-infors`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch tutor info");
        }

        const data = await res.json();
        const found = Array.isArray(data.data)
          ? data.data.find((user: any) => user.userId === idUser)
          : null;

        if (!found) {
          throw new Error("Tutor not found.");
        }

        setTutorData({
          id: found._id || found.id,
          name: found.name || "Unknown Tutor",
          email: found.email || "No email",
          phoneNumber: found.phone || found.phoneNumber || "N/A",
          address: found.address || "N/A",
          description: found.description || "No description provided.",
          avatar: found.avatar || "/placeholder-avatar.jpg",
        });
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorInfo();
  }, [idUser]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500 mt-10">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col p-0 w-full h-full">
        {/* Header */}
        <div className="w-full bg-black border border-gray-700 rounded-lg shadow-md relative overflow-visible mb-4">
          {/* Banner */}
          <div className="relative w-full h-56 bg-gray-700 rounded-t-lg overflow-hidden">
            <img
              src="/tutor-banner.jpg"
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Avatar & User Info */}
          <div className="flex items-center absolute left-8 -bottom-10">
            <div className="w-24 h-24 bg-gray-500 rounded-full border-4 border-black shadow-lg overflow-hidden">
              <img
                src={tutorData?.avatar || "/placeholder-avatar.jpg"}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded-md">
                {tutorData?.name}
              </h2>
              <p className="text-gray-400 text-sm">Tutor</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center mt-16">
          <div className="w-[600px] bg-black border border-gray-700 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold mb-4">Tutor Information</h3>
            <div className="space-y-4">
              <InfoItem label="Email" value={tutorData?.email} icon={<FaEnvelope />} />
              <InfoItem label="Phone Number" value={tutorData?.phoneNumber} icon={<FaPhone />} />
              <InfoItem label="Address" value={tutorData?.address} icon={<FaMapMarkerAlt />} />
              <InfoItem label="Description" value={tutorData?.description} icon={<FaInfoCircle />} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface InfoItemProps {
  label: string;
  value?: string;
  icon: React.ReactNode;
}

function InfoItem({ label, value, icon }: InfoItemProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-gray-700 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-white">{value || "N/A"}</p>
      </div>
    </div>
  );
}
