"use client";

import React, { useState } from "react";
import StaffLayout from "@/app/staff/StaffLayout";

const ListOfUserPage = () => {
  // Định nghĩa rõ kiểu cho userType
  const [userType, setUserType] = useState<"tutor" | "student">("tutor");

  const [tutors, setTutors] = useState([
    {
      _id: "1",
      userId: "user1",
      name: "John Doe",
      path: "/default-avatar.png",
      email: "john@example.com",
      phone: "0123456789",
      address: "123 Main St",
      major: "Math",
      country: "USA",
    },
  ]);
  const [students, setStudents] = useState([
    {
      _id: "2",
      userId: "user2",
      name: "Jane Smith",
      path: "/default-avatar.png",
      email: "jane@example.com",
      phone: "0987654321",
      address: "456 Secondary St",
      major: "Physics",
      country: "USA",
    },
  ]);

  // Dựa vào userType, chọn mảng hiển thị
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

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {/* Chỉ hiển thị tên, email, phone, address, major, country, avatar */}
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
    </div>
  );
};

const PageWithLayout = () => (
  <StaffLayout>
    <ListOfUserPage />
  </StaffLayout>
);

export default PageWithLayout;
