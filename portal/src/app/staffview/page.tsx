"use client";

import React, { useState } from "react";
import StaffForm from "@/app/staffview/staff-form";
import { Button } from "@/app/componets/ui/staffbutton";
import Link from "next/link";

const StaffPage = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="p-4">
      <StaffForm />
      <div className="flex justify-between mt-4">
        {/* Dropdown Menu */}
        <div 
          className="relative"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <Button className="px-4 py-2">All Student - Tutor</Button>
          
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
              <Link href="/tutor-list" className="block px-4 py-2 text-black hover:bg-gray-100">
                Tutor List
              </Link>
              <Link href="/student-list" className="block px-4 py-2 text-black hover:bg-gray-100">
                Student List
              </Link>
            </div>
          )}
        </div>

        <Button className="px-4 py-2" onClick={() => console.log("Show matched couples")}>
          Couple Matched
        </Button>
      </div>
      
      <div className="mt-4 border p-4">
        <div className="grid grid-cols-4 gap-4 border-b pb-2 font-semibold">
          <span>ID</span>
          <span>Email</span>
          <span>Name</span>
          <span>Class</span>
        </div>
        <div className="p-4">Dashboard</div>
      </div>
    </div>
  );
};

export default StaffPage;
