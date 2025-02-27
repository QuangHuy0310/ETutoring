"use client";

export default function StudentCard() {
  return (
    <div className="border p-4 bg-gray-100 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold text-black">Student Name</h3>
      <p className="text-gray-700">Class: Math 101</p>
      <p className="text-gray-700">Subject: Algebra</p>
      <p className="text-gray-700">Time: 10:00 AM - 11:30 AM</p>
    </div>
  );
}
