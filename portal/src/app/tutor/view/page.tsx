"use client";

import { Suspense } from "react";
import Layout from "@/app/componets/layout";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { getAccessTokenFromRefresh } from "@/app/lib/token";

interface UserInfo {
  id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  description?: string;
  avatar?: string;
}

interface DecodedToken {
  id?: string;
  userId?: string;
  sub?: string;
  email: string;
}

export default function ViewTutorPage() {
  return (
    <Layout>
      <Content />
    </Layout>
  );
}

function Content() {
  const searchParams = useSearchParams();
  const idUser = searchParams.get("idUser");

  const [tutorData, setTutorData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string>("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [matched, setMatched] = useState(false);

  useEffect(() => {
    const fetchTutorInfo = async () => {
      try {
        // Lấy accessToken từ refreshToken
        const accessToken = await getAccessTokenFromRefresh();
        
        if (!accessToken || !idUser) {
          setError("Authentication failed or user ID missing.");
          setLoading(false);
          return;
        }

        const decoded = jwtDecode<DecodedToken>(accessToken);
        const studentIdDecoded = decoded.userId || decoded.id || decoded.sub || "";
        setStudentId(studentIdDecoded);

        const res = await fetch(`http://localhost:3002/get-infors?idUser=${idUser}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch tutor info");
        }

        const data = await res.json();
        const found = Array.isArray(data.data) ? data.data[0] : null;

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
          avatar: found.path || "/placeholder-avatar.jpg",
        });

        // 🛠️ Check room existence
        if (studentIdDecoded && idUser) {
          console.log(`🔎 Checking room existence between studentId: ${studentIdDecoded} and tutorId: ${idUser}`);

          const checkRes = await fetch(`http://localhost:3002/get-room-by-ids?user1=${studentIdDecoded}&user2=${idUser}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const checkData = await checkRes.json();
          console.log("📦 Room Check Response:", checkData);

          if (checkRes.ok && checkData?.data?._id) {
            console.log("✅ Room exists! Matched!");
            setMatched(true);
          } else {
            console.log("🚫 No existing room between these users.");
          }
        }
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorInfo();
  }, [idUser]);

  const handleSendRequest = async () => {
    if (!studentId || !idUser) {
      console.error("Missing studentId or tutorId");
      return;
    }
    try {
      setSendingRequest(true);
      
      // Lấy accessToken từ refreshToken
      const accessToken = await getAccessTokenFromRefresh();
      if (!accessToken) {
        throw new Error("Authentication required");
      }

      console.log("🚀 Sending matching request with data:", {
        studentId,
        tutorId: idUser,
      });

      const res = await fetch("http://localhost:3002/matching-request/send-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          studentId,
          tutorId: idUser,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        console.error("❌ Server responded with error:", responseData);
        throw new Error(responseData?.message || "Failed to send matching request");
      }

      console.log("✅ Matching request sent successfully:", responseData);
      setRequestSent(true);
      alert("🎯 Request đã gửi thành công!");
    } catch (error: any) {
      console.error("❌ Error sending matching request:", error);
      alert("❌ Gửi request thất bại, thử lại!");
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (!tutorData) {
    return <div className="text-gray-400 text-center mt-8">Tutor not found</div>;
  }

  return (
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

        {/* Avatar & Info */}
        <div className="flex items-center absolute left-8 -bottom-10">
          <div className="w-24 h-24 bg-gray-500 rounded-full border-4 border-black shadow-lg overflow-hidden">
            <img
              src={tutorData.avatar}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded-md">
              {tutorData.name}
            </h2>
            <p className="text-gray-400 text-sm">Tutor</p>

            {/* Nút */}
            {studentId !== idUser && (
              <>
                {matched ? (
                  <span className="mt-2 inline-block bg-blue-600 px-4 py-1 rounded text-sm text-white">
                    Đã Matched
                  </span>
                ) : (
                  <button
                    className={`mt-2 bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm ${
                      requestSent ? "bg-gray-500 cursor-not-allowed" : ""
                    }`}
                    disabled={requestSent || sendingRequest}
                    onClick={handleSendRequest}
                  >
                    {requestSent ? "Đã gửi yêu cầu" : sendingRequest ? "Đang gửi..." : "Gửi Matching Request"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-center mt-16">
        <div className="w-[600px] bg-black border border-gray-700 p-6 rounded-lg shadow-md text-white">
          <h3 className="text-lg font-semibold mb-4">Tutor Information</h3>
          <div className="space-y-4">
            <InfoItem label="Email" value={tutorData.email} icon={<FaEnvelope />} />
            <InfoItem label="Phone Number" value={tutorData.phoneNumber} icon={<FaPhone />} />
            <InfoItem label="Address" value={tutorData.address} icon={<FaMapMarkerAlt />} />
            <InfoItem label="Description" value={tutorData.description} icon={<FaInfoCircle />} />
          </div>
        </div>
      </div>
    </div>
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
      <div className="p-2 bg-gray-700 rounded-full">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-white">{value || "N/A"}</p>
      </div>
    </div>
  );
}
