"use client";

import { useRouter } from "next/navigation";
import StaffForm from "@/app/staff/staff-form";
import TutorCard from "@/app/staff/tutor-card";
import FilterBar from "@/app/staff/filter-bar";
import StudentCard from "@/app/componets/Studentcard";

export default function StaffPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen">
      {/* Nội dung chính */}
      <div className="flex flex-col flex-1">
        {/* Nút Back và FilterBar */}
        <div className="h-16 bg-gray-300 flex items-center px-4 gap-4 justify-between">
          {/* Nút Back */}
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            ← Back
          </button>

`       {/* Tiêu đề trang */}
          <h1 className="text-xl font-bold text-black flex-1 text-center">
            Pair Tutor & Student
          </h1>

          {/* FilterBar nằm sát phải */}
          <div className="flex">
            <FilterBar />
          </div>
        </div>

        {/* Container chính */}
        <div className="flex flex-1 gap-4 p-4">
          {/* Ô bên trái - Phân công tutor */}
          <div className="w-1/3 border p-4 bg-white shadow-lg rounded-lg">
            <StudentCard />
            <StaffForm />
          </div>

          {/* Danh sách tutor */}
          <div className="flex-1 border p-4 bg-white shadow-lg rounded-lg">
            {/* Danh sách tutor */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <TutorCard />
              <TutorCard />
              <TutorCard />
              <TutorCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
