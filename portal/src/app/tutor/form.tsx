"use client";

import { useState } from "react";

export default function TutorInformationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    address: "",
    dashboardLink: "", 
    description: "",
    expertise: "", // Thêm trường chuyên môn của tutor
    experience: "" // Thêm trường số năm kinh nghiệm
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted Tutor Data:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full p-2 border rounded bg-white text-black"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full p-2 border rounded bg-white text-black"
        />
      </div>
      <input
        type="text"
        name="phoneNumber"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-white text-black"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-white text-black"
      />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-white text-black"
      />
      <input
        type="text"
        name="dashboardLink"
        placeholder="Link Dashboard"
        value={formData.dashboardLink}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-white text-black"
      />
      <input
        type="text"
        name="expertise"
        placeholder="Expertise (e.g. Mathematics, Programming)"
        value={formData.expertise}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-white text-black"
      />
      <input
        type="text"
        name="experience"
        placeholder="Years of Experience"
        value={formData.experience}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-white text-black"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-white text-black h-24"
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Save Tutor Information
      </button>
    </form>
  );
}
