"use client";

import React, { useState, useEffect } from "react";
import StaffLayout from "@/app/staff/StaffLayout";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import PopupDashboard from "./PopupDashboard";

interface User {
  _id: string;
  id: string;
  name: string;
  role: string;
  email: string;
  major?: string;
  // Thêm các thuộc tính người dùng khác nếu cần
}

interface DashboardData {
  totalContributions?: number;
  submissions?: number;
  comments?: number;
  monthlyMatches?: number[];
  monthlyMessages?: number[];
  userStats?: {
    name: string;
    messageCount: number;
  }[];
  // Thêm các số liệu khác nếu cần
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: User[];
}

const StaffDashboard = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userDashboard, setUserDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Lấy tất cả người dùng với vai trò của họ
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const accessToken = getCookie("accessToken");

        if (!accessToken) {
          setIsAuthenticated(false);
          throw new Error("Authentication token not found. Please login again.");
        }

        const response = await fetch(
          `http://localhost:3002/get-role?role=${selectedRole}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) {
          throw new Error(`Error loading data: ${response.status}`);
        }

        const responseData: ApiResponse = await response.json();

        if (responseData.data && Array.isArray(responseData.data)) {
          setUsers(responseData.data);
          setFilteredUsers(responseData.data);
        } else {
          console.error("Unexpected API response format:", responseData);
          throw new Error("Invalid data format received from server");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy vai trò người dùng:", error);
        setError(
          error.message || "Could not load data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [selectedRole, router]);

  // Xử lý thay đổi vai trò
  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  // Xử lý chọn người dùng
  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    setIsLoading(true);

    try {
      const accessToken = getCookie("accessToken");
      if (!accessToken) {
        setIsAuthenticated(false);
        throw new Error("Authentication token not found");
      }

      // Thay thế bằng API thực tế để lấy dữ liệu dashboard người dùng
      // const dashboardResponse = await fetch(`http://localhost:3002/user-dashboard/${user.id}`, {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${accessToken}`,
      //   },
      // });

      // if (dashboardResponse.status === 401) {
      //   setIsAuthenticated(false);
      //   throw new Error("Session expired");
      // }

      // if (!dashboardResponse.ok) {
      //   throw new Error(`Error loading dashboard: ${dashboardResponse.status}`);
      // }

      // const dashboardData = await dashboardResponse.json();
      // setUserDashboard(dashboardData.data);

      // Dữ liệu mẫu tạm thời
      const mockDashboardData: DashboardData = {
        totalContributions: Math.floor(Math.random() * 100),
        submissions: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 30),
        monthlyMatches: [1, 2, 2, 2, 1, 3],
        monthlyMessages: [150, 130, 90, 120, 80, 100],
        userStats: [
          { name: "Kiet", messageCount: 125 },
          { name: "Cuong", messageCount: 85 },
          { name: "Huy", messageCount: 65 },
        ],
      };

      setUserDashboard(mockDashboardData);
      setIsPopupOpen(true);
    } catch (error: any) {
      console.error("Lỗi khi lấy dashboard người dùng:", error);
      setError(error.message || "Could not load user dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Đóng popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedUser(null);
    setUserDashboard(null);
  };

  // Redirect to login
  const redirectToLogin = () => {
    router.push("/login");
  };

  return (
    <StaffLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>

        {!isAuthenticated ? (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="font-bold text-black">Session expired</p>
            <p className="text-black">Please login again to continue.</p>
            <button
              onClick={redirectToLogin}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Login
            </button>
          </div>
        ) : (
          <>
            {/* Chọn vai trò */}
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded ${
                  selectedRole === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => handleRoleChange("user")}
              >
                Users
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  selectedRole === "tutor"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => handleRoleChange("tutor")}
              >
                Tutors
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-black">{error}</p>
              </div>
            )}

            {/* Hiển thị đang tải */}
            {isLoading && !isPopupOpen && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Danh sách người dùng */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id || user.id}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => handleUserClick(user)}
                >
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  {user.major && (
                    <p className="text-sm text-gray-500">Major: {user.major}</p>
                  )}
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && !isLoading && !error && (
              <p className="text-center my-8 text-gray-500">
                No users found for the selected role.
              </p>
            )}

            {/* Import the separated PopupDashboard component */}
            {isPopupOpen && selectedUser && userDashboard && (
              <PopupDashboard
                user={selectedUser}
                dashboardData={userDashboard}
                isLoading={isLoading}
                onClose={closePopup}
              />
            )}
          </>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffDashboard;