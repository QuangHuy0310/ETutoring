"use client";

import React, { useState, useEffect } from "react";
import StaffLayout from "@/app/staff/StaffLayout";
import MatchingForm from "@/app/staff/matching/MatchingForm";
import { getCookie } from "cookies-next";

interface User {
  id: string;
  name: string;
  email: string;
}

const MatchingPage = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [tutors, setTutors] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<User | null>(null);
  const [subject, setSubject] = useState("Subject");
  const [slot, setSlot] = useState("Slot");
  const [studentSearch, setStudentSearch] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm fetch dữ liệu từ API
  const fetchUsers = async (
    role: "user" | "tutor",
    setUsers: React.Dispatch<React.SetStateAction<User[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = getCookie('accessToken');
      if (!accessToken) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(`http://localhost:3002/get-role?role=${role}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${role} data: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.data || []); // Lấy danh sách từ `data.data`
    } catch (err: any) {
      console.error(`Error fetching ${role} data:`, err);
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students và tutors khi component mount
  useEffect(() => {
    fetchUsers("user", setStudents, setLoadingStudents);
    fetchUsers("tutor", setTutors, setLoadingTutors);
  }, []);

  // Cập nhật danh sách tìm kiếm khi nhập từ khóa
  useEffect(() => {
    setFilteredStudents(
      students.filter((student) =>
        student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase())
      )
    );
  }, [studentSearch, students]);

  useEffect(() => {
    setFilteredTutors(
      tutors.filter((tutor) =>
        tutor.name.toLowerCase().includes(tutorSearch.toLowerCase()) ||
        tutor.email.toLowerCase().includes(tutorSearch.toLowerCase())
      )
    );
  }, [tutorSearch, tutors]);

  return (
    <StaffLayout>
      <div className="p-6 min-h-screen flex flex-col bg-[#0B0F19] text-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Matching Page</h1>
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border rounded-lg bg-[#1E2432] text-white hover:bg-[#2A4E89]"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Subject" disabled>
                Subject
              </option>
              <option value="IT">IT</option>
              <option value="Business">Business</option>
              <option value="Graphic">Graphic</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg bg-[#1E2432] text-white hover:bg-[#2A4E89]"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              <option value="Slot" disabled>
                Slot
              </option>
              <option value="Slot 1: 8:00-10:00">Slot 1: 8:00-10:00</option>
              <option value="Slot 2: 10:00-12:00">Slot 2: 10:00-12:00</option>
              <option value="Slot 3: 13:00-15:00">Slot 3: 13:00-15:00</option>
              <option value="Slot 4: 15:00-17:00">Slot 4: 15:00-17:00</option>
              <option value="Slot 5: 17:00-19:00">Slot 5: 17:00-19:00</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 flex-grow">
          {/* Student List */}
          <div className="bg-[#1E2432] p-4 rounded-lg shadow-md h-full overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Student List</h2>
            <input
              type="text"
              placeholder="Search"
              className="w-full p-2 mb-4 border rounded bg-[#0B0F19] text-white"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            {loadingStudents ? (
              <p>Loading students...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedStudent?.id === student.id ? "bg-[#3A6AB4]" : "hover:bg-[#2A4E89]"
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div>
                    <p className="font-bold">{student.name}</p>
                    <p className="text-sm text-gray-300">{student.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Matching Form */}
          <div className="bg-[#1E2432] p-4 rounded-lg shadow-md h-full flex items-start justify-center">
            <MatchingForm
              selectedStudent={selectedStudent}
              selectedTutor={selectedTutor}
              setSelectedStudent={setSelectedStudent}
              setSelectedTutor={setSelectedTutor}
            />
          </div>

          {/* Tutor List */}
          <div className="bg-[#1E2432] p-4 rounded-lg shadow-md h-full overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Tutor List</h2>
            <input
              type="text"
              placeholder="Search"
              className="w-full p-2 mb-4 border rounded bg-[#0B0F19] text-white"
              value={tutorSearch}
              onChange={(e) => setTutorSearch(e.target.value)}
            />
            {loadingTutors ? (
              <p>Loading tutors...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              filteredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTutor?.id === tutor.id ? "bg-[#3A6AB4]" : "hover:bg-[#2A4E89]"
                  }`}
                  onClick={() => setSelectedTutor(tutor)}
                >
                  <div>
                    <p className="font-bold">{tutor.name}</p>
                    <p className="text-sm text-gray-300">{tutor.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default MatchingPage;
