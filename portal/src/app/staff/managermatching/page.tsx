"use client";

import React, { useEffect, useState } from "react";
import StaffLayout from "@/app/staff/StaffLayout";
import { getCookie } from "cookies-next";

interface MatchingItem {
  studentName: string;
  tutorName: string;
  status: string;
}

interface RequestItem {
  _id: string;
  studentId: string;
  tutorId: string;
  status: string;
}

type ViewMode = "manager" | "request";

const ManagerMatchingPage: React.FC = () => {
  const [matchings, setMatchings] = useState<MatchingItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("manager");
  const [requestFilter, setRequestFilter] = useState<"pending" | "accepted" | "rejected">("pending");

  const fetchAllRooms = async (token: string) => {
    const rooms: any[] = [];

    const res = await fetch('http://localhost:3002/get-all-room?page=1', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const resData = await res.json();
    const pageRooms = Array.isArray(resData?.data?.data) ? resData.data.data : [];
    rooms.push(...pageRooms);

    const totalPages = resData?.data?.totalPages ?? 1;
    if (totalPages > 1) {
      const fetchPromises = [];
      for (let page = 2; page <= totalPages; page++) {
        fetchPromises.push(
          fetch(`http://localhost:3002/get-all-room?page=${page}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(async (res) => {
            const pageData = await res.json();
            return Array.isArray(pageData?.data?.data) ? pageData.data.data : [];
          })
        );
      }
      const roomsFromOtherPages = await Promise.all(fetchPromises);
      roomsFromOtherPages.forEach((pageRooms) => {
        rooms.push(...pageRooms);
      });
    }
    return rooms;
  };

  const fetchMatchingRequests = async (status: "pending" | "accepted" | "rejected") => {
    try {
      const rawToken = getCookie('accessToken');
      const token = typeof rawToken === 'string' ? rawToken : '';

      const res = await fetch(`http://localhost:3002/matching-request/list?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(`Fetched matching-requests (${status}):`, data);
      setRequests(data.data || []);
    } catch (err) {
      console.error("❌ Error fetching matching requests:", err);
    }
  };

  const updateRequestStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      const rawToken = getCookie('accessToken');
      const token = typeof rawToken === 'string' ? rawToken : '';

      const res = await fetch(`http://localhost:3002/matching-request/${id}/update-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      console.log("✅ Updated status:", result);

      fetchMatchingRequests(requestFilter);
    } catch (err) {
      console.error("❌ Error updating request status:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const rawToken = getCookie('accessToken');
        const token = typeof rawToken === 'string' ? rawToken : '';

        const rooms = await fetchAllRooms(token);
        if (rooms.length === 0) {
          setMatchings([]);
          return;
        }

        const matchingList: MatchingItem[] = rooms.map((room: any) => {
          const student = room.userInfos?.[0]?.name || "";
          const tutor = room.userInfos?.[1]?.name || "";
          return {
            studentName: student,
            tutorName: tutor,
            status: "Matched",
          };
        });

        setMatchings(matchingList);
      } catch (err: any) {
        console.error("❌ Error fetching matchings:", err);
        setError(err.message || "Đã xảy ra lỗi.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (viewMode === "request") {
      fetchMatchingRequests(requestFilter);
    }
  }, [viewMode, requestFilter]);

  return (
    <StaffLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Manager Matching</h1>

        {/* View switch */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setViewMode("manager")}
            className={`px-4 py-2 rounded ${viewMode === "manager" ? "bg-gray-400" : "bg-blue-600 text-white"}`}
          >
            Matching Manager
          </button>
          <button
            onClick={() => setViewMode("request")}
            className={`px-4 py-2 rounded ${viewMode === "request" ? "bg-gray-400" : "bg-blue-600 text-white"}`}
          >
            Matching Request Manager
          </button>
        </div>

        {/* Filter buttons */}
        {viewMode === "request" && (
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setRequestFilter("pending")}
              className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-1 rounded"
            >
              Pending
            </button>
            <button
              onClick={() => setRequestFilter("accepted")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
            >
              Accepted
            </button>
            <button
              onClick={() => setRequestFilter("rejected")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
            >
              Rejected
            </button>
          </div>
        )}

        {/* Tables */}
        {error && <div className="text-red-500">{error}</div>}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {viewMode === "manager" && (
              <table className="min-w-full bg-white text-black border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Student</th>
                    <th className="border p-2">Tutor</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matchings.map((item, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="border p-2">{item.studentName}</td>
                      <td className="border p-2">{item.tutorName}</td>
                      <td className="border p-2">
                        <span className="px-2 py-1 rounded-full bg-green-500 text-white">
                          {item.status}
                        </span>
                      </td>
                      <td className="border p-2">
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          disabled
                        >
                          Xóa Match
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {viewMode === "request" && (
              <table className="min-w-full bg-white text-black border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Student ID</th>
                    <th className="border p-2">Tutor ID</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((item) => (
                    <tr key={item._id} className="text-center">
                      <td className="border p-2">{item.studentId}</td>
                      <td className="border p-2">{item.tutorId}</td>
                      <td className="border p-2 flex justify-center items-center gap-2">
                        {item.status === "pending" ? (
                          <>
                            <button
                              onClick={() => updateRequestStatus(item._id, "accepted")}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateRequestStatus(item._id, "rejected")}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span>{item.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </StaffLayout>
  );
};

export default ManagerMatchingPage;
