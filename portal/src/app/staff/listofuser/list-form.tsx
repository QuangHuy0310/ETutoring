"use client";

import React, { useState } from "react";

const ListOfUserForm = ({ setUsers }: { setUsers: React.Dispatch<React.SetStateAction<any[]>> }) => {
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

    setUsers((prevUsers) => [
      ...prevUsers,
      {
        id: prevUsers.length + 1,
        name,
        email,
        class: userClass,
        avatar,
      },
    ]);

    setName("");
    setEmail("");
    setUserClass("");
    setAvatar("/default-avatar.png");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border border-gray-300 rounded">
      <h2 className="text-lg font-semibold mb-4">Add User</h2>

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
        Add User
      </button>
    </form>
  );
};

export default ListOfUserForm;
