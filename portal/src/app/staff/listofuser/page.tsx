"use client";

import React, { useState } from "react";
import StaffLayout from "@/app/staff/StaffLayout";
// import ListOfUserForm from "@/app/staff/listofuser/list-form";

const ListOfUserPage = () => {
  const [userType, setUserType] = useState("tutor");
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", class: "Math", avatar: "/default-avatar.png" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", class: "Physics", avatar: "/default-avatar.png" },
  ]);

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
            <th className="border p-2">Avatar</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Class</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border">
              <td className="border p-2">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              </td>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.class}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Bọc trang trong layout
const PageWithLayout = () => (
  <StaffLayout>
    <ListOfUserPage />
  </StaffLayout>
);

export default PageWithLayout;
