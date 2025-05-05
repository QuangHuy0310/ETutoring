"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import AddFacultyModal from "./add_faculty_form";
import EditFacultyModal from "./edit_faculty_form";
import AdminLayout from "../AdminLayout";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCookie } from "cookies-next";

interface Faculty {
  _id: string;
  name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function FacultyManagement() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [currentFaculty, setCurrentFaculty] = useState<Faculty | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch major list
  const fetchFaculties = async () => {
    setIsLoading(true);
    try {
      const token = getCookie("accessToken");
      const response = await axios.get(`${API_URL}/get-major`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data && response.data.data) {
        setFaculties(response.data.data);
      } else {
        toast.error("Invalid data format received from the server");
      }
    } catch (error) {
      console.error("Error fetching faculties:", error);
      toast.error("Failed to fetch faculties. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  // Add new faculty - simplified to only handle state update after the API call in the modal
  const handleAddFaculty = (newFaculty: { _id: string; name: string }) => {
    // Update the faculties state with the new faculty returned from the API
    setFaculties([...faculties, newFaculty]);
    setShowAddForm(false);
    // No need to call API here as it's handled in the AddFacultyModal
  };

  // Update faculty - already simplified to only handle state update
  const handleUpdateFaculty = (updatedFaculty: Faculty) => {
    // Update the local state after successful edit in the modal
    setFaculties(
      faculties.map((faculty) =>
        faculty._id === updatedFaculty._id ? updatedFaculty : faculty
      )
    );
    setShowEditForm(false);
    // No need to call API here as it's handled in the EditFacultyModal
  };

  // Delete faculty
  const handleDeleteFaculty = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this faculty?")) {
      try {
        const token = getCookie("accessToken");
        await axios.delete(`${API_URL}/delete-major?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setFaculties(faculties.filter((faculty) => faculty._id !== id));
        toast.success("Faculty deleted successfully");
      } catch (error) {
        console.error("Error deleting faculty:", error);
        toast.error("Failed to delete faculty. Please try again later.");
      }
    }
  };

  // Filter based on search
  const filteredFaculties = faculties.filter((faculty) =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Faculty Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition"
            >
              <FaPlus className="mr-2" /> Add Faculty
            </button>
            <input
              type="text"
              placeholder="Search faculties..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Faculties List */}
        {isLoading ? (
          <div className="flex justify-center my-10">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFaculties.length > 0 ? (
                  filteredFaculties.map((faculty) => (
                    <tr key={faculty._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{faculty.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setCurrentFaculty(faculty);
                            setShowEditForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit faculty"
                        >
                          <FaEdit className="inline text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(faculty._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete faculty"
                        >
                          <FaTrash className="inline text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? "No matching faculties found" : "No faculties found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Faculty Modal */}
        <AddFacultyModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSave={handleAddFaculty}
        />

        {/* Edit Faculty Modal */}
        {currentFaculty && (
          <EditFacultyModal
            isOpen={showEditForm}
            onClose={() => setShowEditForm(false)}
            onSave={handleUpdateFaculty}
            faculty={currentFaculty}
          />
        )}

        <ToastContainer position="bottom-right" />
      </div>
    </AdminLayout>
  );
}
