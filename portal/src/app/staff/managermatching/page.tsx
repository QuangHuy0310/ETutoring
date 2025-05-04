"use client";

import React, { useEffect, useState } from "react";
import StaffLayout from "@/app/staff/StaffLayout";
import { getCookie } from "cookies-next";
import ReactModal from "react-modal";

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

  // New Slot Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({ name: "", timeStart: "", timeEnd: "" });

  useEffect(() => {
    ReactModal.setAppElement("body");
  }, []);

  const fetchAllRooms = async (token: string) => {
    const rooms: any[] = [];

    const res = await fetch("http://localhost:3002/get-all-room?page=1", {
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
      const rawToken = getCookie("accessToken");
      const token = typeof rawToken === "string" ? rawToken : "";

      const res = await fetch(`http://localhost:3002/matching-request/list?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data.data || []);
    } catch (err) {
      console.error("❌ Error fetching matching requests:", err);
    }
  };

  const updateRequestStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      const rawToken = getCookie("accessToken");
      const token = typeof rawToken === "string" ? rawToken : "";

      const res = await fetch(`http://localhost:3002/matching-request/${id}/update-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
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
        const rawToken = getCookie("accessToken");
        const token = typeof rawToken === "string" ? rawToken : "";

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

        {/* View switch & New Slot */}
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
          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            New Slot
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

        {/* Matching Tables */}
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

        {/* Slot Modal */}
        <ReactModal
  isOpen={isSlotModalOpen}
  onRequestClose={() => setIsSlotModalOpen(false)}
  className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-40"
  overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
>
  <h2 className="text-xl font-bold mb-4 text-black">Create New Slot</h2>
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      const token = getCookie("accessToken");
      try {
        const query = new URLSearchParams(slotForm).toString();
        const res = await fetch(`http://localhost:3002/api/v1/slots/new-comment?${query}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to create slot");
        alert("✅ Slot created!");
        setSlotForm({ name: "", timeStart: "", timeEnd: "" });
        setIsSlotModalOpen(false);
      } catch (err) {
        console.error("❌ Slot creation error:", err);
        alert("❌ Failed to create slot!");
      }
    }}
    className="flex flex-col gap-4 text-black"
  >
    <input
      type="text"
      name="name"
      placeholder="Slot Name"
      value={slotForm.name}
      onChange={(e) => setSlotForm({ ...slotForm, name: e.target.value })}
      className="border p-2 rounded"
      required
    />
    <input
      type="time"
      name="timeStart"
      value={slotForm.timeStart}
      onChange={(e) => setSlotForm({ ...slotForm, timeStart: e.target.value })}
      className="border p-2 rounded"
      required
    />
    <input
      type="time"
      name="timeEnd"
      value={slotForm.timeEnd}
      onChange={(e) => setSlotForm({ ...slotForm, timeEnd: e.target.value })}
      className="border p-2 rounded"
      required
    />
    <div className="flex justify-end gap-2">
      <button
        type="button"
        className="px-4 py-2 bg-gray-400 rounded text-white"
        onClick={() => setIsSlotModalOpen(false)}
      >
        Cancel
      </button>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Create
      </button>
    </div>
  </form>
</ReactModal>

      </div>
    </StaffLayout>
  );
};

export default ManagerMatchingPage;
