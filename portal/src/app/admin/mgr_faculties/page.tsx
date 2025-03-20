"use client";

import React, { useState } from "react";
import AdminLayout from "@/app/admin/component/AdminLayout";

interface Faculty {
  id: number;
  name: string;
}

const FacultyManagerPage: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([
    {
      id: 1,
      name: "IT",
    },
    {
      id: 2,
      name: "Graphic",
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredFaculties = faculties.filter(faculty => 
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteFaculty = (id: number) => {
    if (window.confirm("Are you sure you want to delete this faculty?")) {
      setFaculties(faculties.filter((faculty) => faculty.id !== id));
    }
  };
  
  const editFaculty = (id: number) => {
    alert(`Edit faculty with ID: ${id}`);
  };
  
  const createFaculty = () => {
    alert("Create new faculty functionality will be implemented");
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Faculties</h1>

        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by faculty name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <button
            onClick={createFaculty}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-full md:w-auto"
          >
            Create Faculty
          </button>
        </div>

        <div className="border rounded-lg p-4 bg-white text-black">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculties.length > 0 ? (
                filteredFaculties.map((faculty) => (
                  <tr key={faculty.id} className="text-center">
                    <td className="border p-2">{faculty.id}</td>
                    <td className="border p-2">{faculty.name}</td>
                    <td className="border p-2">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => editFaculty(faculty.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteFaculty(faculty.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {searchTerm ? "No matching faculties found" : "No faculties found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FacultyManagerPage;
