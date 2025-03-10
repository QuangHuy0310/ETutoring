"use client";

import React, { useState } from "react";
import StaffLayout from "@/app/staff/StaffLayout";
import MatchingForm from "@/app/staff/matching/MatchingForm";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

const students: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", avatar: "/avatar1.png" },
  { id: 2, name: "Bob", email: "bob@example.com", avatar: "/avatar2.png" },
  { id: 3, name: "Charlie", email: "charlie@example.com", avatar: "/avatar3.png" },
];

const tutors: User[] = [
  { id: 1, name: "David", email: "david@example.com", avatar: "/avatar4.png" },
  { id: 2, name: "Eve", email: "eve@example.com", avatar: "/avatar5.png" },
  { id: 3, name: "Frank", email: "frank@example.com", avatar: "/avatar6.png" },
];

const MatchingPage = () => {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<User | null>(null);
  const [subject, setSubject] = useState("Subject");
  const [slot, setSlot] = useState("Slot");

  return (
    <StaffLayout>
      <div className="p-6 min-h-screen flex flex-col bg-[#0B0F19] text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Matching page</h1>

          {/* Bộ lọc Subject & Slot */}
          <div className="flex gap-4">
            {/* Dropdown chọn môn học */}
            <select
              className="px-4 py-2 border rounded-lg bg-[#1E2432] text-white hover:bg-[#2A4E89]"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Subject" disabled>Subject</option>
              <option value="IT">IT</option>
              <option value="Business">Business</option>
              <option value="Graphic">Graphic</option>
            </select>

            {/* Dropdown chọn Slot */}
            <select
              className="px-4 py-2 border rounded-lg bg-[#1E2432] text-white hover:bg-[#2A4E89]"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              <option value="Slot" disabled>Slot</option>
              <option value="Slot 1: 8:00-10:00">Slot 1: 8:00-10:00</option>
              <option value="Slot 2: 10:00-12:00">Slot 2: 10:00-12:00</option>
              <option value="Slot 3: 13:00-15:00">Slot 3: 13:00-15:00</option>
              <option value="Slot 4: 15:00-17:00">Slot 4: 15:00-17:00</option>
              <option value="Slot 5: 17:00-19:00">Slot 5: 17:00-19:00</option>
            </select>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="grid grid-cols-3 gap-4 flex-grow">
          {/* Danh sách sinh viên */}
          <div className="bg-[#1E2432] p-4 rounded-lg shadow-md h-full overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Student List</h2>
            <input type="text" placeholder="Search" className="w-full p-2 mb-4 border rounded bg-[#0B0F19] text-white" />
            {students.map((student) => (
              <div
                key={student.id}
                className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedStudent?.id === student.id ? "bg-[#3A6AB4]" : "hover:bg-[#2A4E89]"
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                <img src={student.avatar} alt="Avatar" className="w-12 h-12 rounded-full border" />
                <div>
                  <p className="font-bold">{student.name}</p>
                  <p className="text-sm text-gray-300">{student.email}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form Matching */}
          <div className="bg-[#1E2432] p-4 rounded-lg shadow-md h-full flex items-center justify-center">
          <MatchingForm
            selectedStudent={selectedStudent}
            selectedTutor={selectedTutor}
            setSelectedStudent={setSelectedStudent}
            setSelectedTutor={setSelectedTutor}
          />
          </div>

          {/* Danh sách tutor */}
          <div className="bg-[#1E2432] p-4 rounded-lg shadow-md h-full overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Tutor List</h2>
            <input type="text" placeholder="Search" className="w-full p-2 mb-4 border rounded bg-[#0B0F19] text-white" />
            {tutors.map((tutor) => (
              <div
                key={tutor.id}
                className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedTutor?.id === tutor.id ? "bg-[#3A6AB4]" : "hover:bg-[#2A4E89]"
                }`}
                onClick={() => setSelectedTutor(tutor)}
              >
                <img src={tutor.avatar} alt="Avatar" className="w-12 h-12 rounded-full border" />
                <div>
                  <p className="font-bold">{tutor.name}</p>
                  <p className="text-sm text-gray-300">{tutor.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default MatchingPage;