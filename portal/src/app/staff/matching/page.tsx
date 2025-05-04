"use client";

import React, { useState, useEffect } from "react";
import StaffLayout from "@/app/staff/StaffLayout";
import MatchingForm from "@/app/staff/matching/MatchingForm";
import { getCookie } from "cookies-next";

interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
}

const MatchingPage = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [tutors, setTutors] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<User[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<User[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<User | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [tutorSearch, setTutorSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmMatching = async (studentIds: string[], tutorId: string) => {
    try {
      const token = getCookie("accessToken");
      if (!token) {
        alert("Không tìm thấy token");
        return;
      }

      const res = await fetch(`http://localhost:3002/bulk-matching`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds,
          tutorId,
          status: "on",
        }),
      });

      if (!res.ok) {
        console.error("❌ Bulk Matching thất bại:", res.status);
        alert("Matching thất bại!");
        return;
      }

      alert("✅ Matching thành công!");
      setSelectedStudents([]);
      setSelectedTutor(null);
    } catch (err) {
      console.error("❌ Lỗi matching:", err);
      alert("Có lỗi xảy ra khi matching!");
    }
  };

  const fetchUsers = async (
    role: "user" | "tutor",
    setUsers: React.Dispatch<React.SetStateAction<User[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = getCookie("accessToken");
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
      const mapped = (data.data || []).map((u: any) => ({
        id: u._id || "",
        userId: u.userId,
        name: u.name,
        email: u.email,
        avatar: u.path || "",
      }));

      const deduped = Array.from(
        new Map(mapped.map((item) => [item.email, item])).values()
      );

      setUsers(deduped);
    } catch (err: any) {
      console.error(`Error fetching ${role} data:`, err);
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers("user", setStudents, setLoadingStudents);
    fetchUsers("tutor", setTutors, setLoadingTutors);
  }, []);

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

  const toggleSelectStudent = (student: User) => {
    setSelectedStudents((prev) => {
      const exists = prev.find((s) => s.id === student.id);
      if (exists) {
        return prev.filter((s) => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  return (
    <StaffLayout>
      <div className="p-6 min-h-screen flex flex-col bg-[#0B0F19] text-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Matching Page</h1>
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
              filteredStudents.map((student) => {
                const isSelected = selectedStudents.some((s) => s.id === student.id);
                return (
                  <div
                    key={student.id}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected ? "bg-[#3A6AB4]" : "hover:bg-[#2A4E89]"
                    }`}
                    onClick={() => toggleSelectStudent(student)}
                  >
                    <input type="checkbox" readOnly checked={isSelected} />
                    <div>
                      <p className="font-bold">{student.name}</p>
                      <p className="text-sm text-gray-300">{student.email}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Matching Form */}
          <div className="bg-[#1E2432] p-4 rounded-lg shadow-md h-full flex items-start justify-center">
            <MatchingForm
              selectedStudents={selectedStudents}
              selectedTutor={selectedTutor}
              setSelectedStudents={setSelectedStudents}
              setSelectedTutor={setSelectedTutor}
              onConfirmMatch={() => {
                if (selectedStudents.length > 0 && selectedTutor) {
                  handleConfirmMatching(selectedStudents.map((s) => s.userId), selectedTutor.userId);
                }
              }}
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
