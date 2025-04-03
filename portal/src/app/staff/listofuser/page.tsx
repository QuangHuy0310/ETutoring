"use client";

import React, { useState, useEffect } from "react";
import StaffLayout from "@/app/staff/StaffLayout";

const ListOfUserPage = () => {
  const [userType, setUserType] = useState<"tutor" | "student">("tutor");
  const [tutors, setTutors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch dữ liệu khi userType thay đổi
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const role = userType === "tutor" ? "tutor" : "user"; // role trong DB
        const res = await fetch(`/api/get-role?role=${role}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (userType === "tutor") {
          setTutors(data);
        } else {
          setStudents(data);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userType]);

  const currentUsers = userType === "tutor" ? tutors : students;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">List of User</h1>
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 border ${userType === "tutor" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setUserType("tutor")}
        >
          Tutor List
        </button>
        <button
          className={`px-4 py-2 border ${userType === "student" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setUserType("student")}
        >
          Student List
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Major</th>
              <th className="border p-2">Country</th>
              <th className="border p-2">Avatar</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id} className="border">
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.phone}</td>
                <td className="border p-2">{user.address}</td>
                <td className="border p-2">{user.major}</td>
                <td className="border p-2">{user.country}</td>
                <td className="border p-2">
                  <img src={user.path} alt={user.name} className="w-10 h-10 rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
