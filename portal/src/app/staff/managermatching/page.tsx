"use client";

import React from "react";
import StaffLayout from "@/app/staff/StaffLayout";

interface MatchingData {
  studentName: string;
  tutorName: string;
  subject: string;
  timeSlot: string;
  status: string;
}

const mockMatchings: MatchingData[] = [
  { studentName: "Alice", tutorName: "Mr. John", subject: "Math", timeSlot: "10:00 - 11:00", status: "Studying" },
  { studentName: "Bob", tutorName: "Ms. Anna", subject: "English", timeSlot: "14:00 - 15:00", status: "Reserved" },
];

const ManagerMatchingPage: React.FC = () => {
  return (
    <StaffLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Manager Matching</h1>

        <div className="border rounded-lg p-4 shadow-md bg-white text-black">
          <h2 className="text-xl font-semibold mb-3">Matching List</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Student Name</th>
                <th className="border p-2">Tutor Name</th>
                <th className="border p-2">Subject</th>
                <th className="border p-2">Time Slot</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockMatchings.length > 0 ? (
                mockMatchings.map((match, index) => (
                  <tr key={index} className="text-center">
                    <td className="border p-2">{match.studentName}</td>
                    <td className="border p-2">{match.tutorName}</td>
                    <td className="border p-2">{match.subject}</td>
                    <td className="border p-2">{match.timeSlot}</td>
                    <td className="border p-2">{match.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">No matchings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </StaffLayout>
  );
};

export default ManagerMatchingPage;
