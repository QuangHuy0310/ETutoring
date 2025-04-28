"use client";

import React, { useEffect, useState } from "react";
import StaffLayout from "@/app/staff/StaffLayout";
import { getCookie } from "cookies-next";

interface MatchingItem {
  roomId: string;
  studentName: string;
  tutorName: string;
  status: string;
}

interface UserInfo {
  userId: string;
  name: string;
}

const ManagerMatchingPage: React.FC = () => {
  const [matchings, setMatchings] = useState<MatchingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRooms = async (token: string) => {
    const rooms: any[] = [];

    const res = await fetch('http://localhost:3002/get-all-room?page=1', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const resData = await res.json();
    const pageRooms = Array.isArray(resData?.data?.data) ? resData.data.data : [];
    rooms.push(...pageRooms);

    const totalPages = resData?.data?.totalPages ?? 1;
    console.log(`🔵 Tổng số trang cần fetch: ${totalPages}`);

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

    console.log("✅ Tổng số rooms fetch được:", rooms.length);
    return rooms;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = getCookie('accessToken');
        if (!token) throw new Error("Vui lòng đăng nhập để xem trang này");

        const rooms = await fetchAllRooms(token);

        if (rooms.length === 0) {
          setMatchings([]);
          return;
        }

        const allUserInfos: UserInfo[] = rooms.flatMap((room: any) => {
          if (Array.isArray(room.userInfos)) {
            return room.userInfos.map((user: any) => ({
              userId: user.userId,
              name: user.name,
            }));
          }
          return [];
        });

        if (allUserInfos.length === 0) {
          setMatchings([]);
          return;
        }

        const roleResults = await Promise.all(
          allUserInfos.map(async (user) => {
            const accessToken = getCookie('accessToken');
            try {
              const res = await fetch(`http://localhost:3002/api/v1/users/get-role-byId?id=${user.userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });

              if (!res.ok) {
                console.warn(`⚠️ Không tìm thấy role cho userId ${user.userId}, fallback role=user`);
                return {
                  userId: user.userId,
                  name: user.name,
                  role: "user",
                };
              }

              const data = await res.json();
              return {
                userId: user.userId,
                name: user.name,
                role: (data?.data?.role || "user").toLowerCase(),
              };
            } catch (error) {
              console.error(`❌ Fetch role failed for userId ${user.userId}`, error);
              return {
                userId: user.userId,
                name: user.name,
                role: "user",
              };
            }
          })
        );

        const matchingList: MatchingItem[] = rooms
          .filter((room: any) => {
            const usersInRoom = (room.userInfos || []).map((user: any) => {
              return roleResults.find((r) => r.userId === user.userId);
            }).filter(Boolean);

            // 👇 Nếu trong room có admin hoặc staff => BỎ room
            const hasAdminOrStaff = usersInRoom.some((user) => user?.role === "admin" || user?.role === "staff");
            return !hasAdminOrStaff;
          })
          .map((room: any) => {
            const usersInRoom = (room.userInfos || []).map((user: any) => {
              return roleResults.find((r) => r.userId === user.userId);
            }).filter(u => u && ["student", "user", "tutor"].includes(u.role));

            const student = usersInRoom.find((u) => u?.role === "student" || u?.role === "user");
            const tutor = usersInRoom.find((u) => u?.role === "tutor");

            return {
              roomId: room._id,
              studentName: student?.name || "",
              tutorName: tutor?.name || "",
              status: "Matched",
            };
          });

        setMatchings(matchingList);
      } catch (err: any) {
        console.error("❌ Bắt lỗi tổng quát:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <StaffLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Manager Matching</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-black p-4 mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 text-black">
              <thead className="bg-gray-100">
                <tr>
                  {/* <th className="border p-2">Room ID</th> 👈 HIDE Room ID */}
                  <th className="border p-2">Student</th>
                  <th className="border p-2">Tutor</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matchings.length > 0 ? (
                  matchings.map((item) => (
                    <tr key={item.roomId} className="text-center">
                      {/* <td className="border p-2 text-xs break-words">{item.roomId}</td> 👈 HIDE */}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6">
                      Không có dữ liệu matching.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default ManagerMatchingPage;
