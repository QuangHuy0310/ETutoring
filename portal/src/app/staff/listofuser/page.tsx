"use client";

import React, { useState, useEffect } from "react";
import StaffLayout from "@/app/staff/StaffLayout";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";

// User data interface
interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  major: string;
}

// API response interface
interface ApiResponse {
  statusCode: number;
  message: string;
  data: User[];
}

const ListOfUserPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<"tutor" | "user">("tutor");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Fetch data when userType changes
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = getCookie('accessToken');

        if (!accessToken) {
          setIsAuthenticated(false);
          throw new Error("Authentication token not found. Please login again.");
        }

        const response = await fetch(`http://localhost:3002/get-role?role=${userType}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

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
        } else {
          console.error("Unexpected API response format:", responseData);
          throw new Error("Invalid data format received from server");
        }
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setError(err.message || "Could not load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userType]);

  const redirectToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">User List</h1>

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
          <div className="flex gap-4 mb-4">
            <button
              className={`px-4 py-2 border rounded-md transition ${
                userType === "tutor" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"
              }`}
              onClick={() => setUserType("tutor")}
            >
              Tutor List
            </button>
            <button
              className={`px-4 py-2 border rounded-md transition ${
                userType === "user" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"
              }`}
              onClick={() => setUserType("user")}
            >
              Student List
            </button>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-black">{error}</p>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="w-full border-collapse bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-3 text-left text-black">Full Name</th>
                    <th className="border p-3 text-left text-black">Email</th>
                    <th className="border p-3 text-left text-black">Major</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="border p-3 text-black">{user.name || "Not updated"}</td>
                      <td className="border p-3 text-black">{user.email}</td>
                      <td className="border p-3 text-black">{user.major || "Not specified"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
              <p className="text-black">No users found.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const PageWithLayout = () => (
  <StaffLayout>
    <ListOfUserPage />
  </StaffLayout>
);

export default PageWithLayout;