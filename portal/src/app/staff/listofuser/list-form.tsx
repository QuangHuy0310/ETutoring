"use client";

import React, { useState } from "react";

interface ListOfUserFormProps {
  userType: "tutor" | "student";
  setTutors: React.Dispatch<React.SetStateAction<any[]>>;
  setStudents: React.Dispatch<React.SetStateAction<any[]>>;
}

const ListOfUserForm: React.FC<ListOfUserFormProps> = ({ userType, setTutors, setStudents }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userClass, setUserClass] = useState("");
  const [avatar, setAvatar] = useState("/default-avatar.png");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !userClass) {
      alert("Please fill in all fields.");
      return;
    }

    // Tạo đối tượng user mới với id duy nhất dựa trên timestamp
    const newUser = {
      id: Date.now(),
      name,
      email,
      class: userClass,
      avatar,
    };

    // Cập nhật danh sách dựa theo loại user
    if (userType === "tutor") {
      setTutors((prevUsers) => [...prevUsers, newUser]);
    } else {
      setStudents((prevUsers) => [...prevUsers, newUser]);
    }

    // Reset form sau khi submit
    setName("");
    setEmail("");
    setUserClass("");
    setAvatar("/default-avatar.png");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border border-gray-300 rounded">
      <h2 className="text-lg font-semibold mb-4">Add {userType === "tutor" ? "Tutor" : "Student"}</h2>

      <div className="mb-4">
        <label className="block font-medium">Avatar URL:</label>
        <input
          type="text"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter image URL"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter name"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter email"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium">Class:</label>
        <input
          type="text"
          value={userClass}
          onChange={(e) => setUserClass(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter class"
        />
      </div>

      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Add {userType === "tutor" ? "Tutor" : "Student"}
      </button>
    </form>
  );
};

export default ListOfUserForm;
