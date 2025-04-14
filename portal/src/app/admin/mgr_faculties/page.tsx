"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import AddFacultyModal from "./add_faculty_form";
import EditFacultyModal from "./edit_faculty_form"
import AdminLayout from "../AdminLayout";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCookie } from "cookies-next";

interface Faculty {
  _id: string;
  name: string;
  // Thêm các trường khác nếu cần
}

export default function FacultyManagement() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [currentFaculty, setCurrentFaculty] = useState<Faculty | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Lấy danh sách khoa
  const fetchFaculties = async () => {
    setIsLoading(true);
    try {
      const token = getCookie("accessToken");
      const response = await axios.get(`http://localhost:3002/get-major`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFaculties(response.data.data);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      toast.error("Failed to fetch faculties");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  // Thêm khoa mới
  const handleAddFaculty = async (faculty: { name: string }) => {
    try {
      const token = getCookie("accessToken");
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/faculty`, faculty, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFaculties([...faculties, response.data.data]);
      setShowAddForm(false);
      toast.success("Faculty added successfully");
    } catch (error) {
      console.error("Error adding faculty:", error);
      toast.error("Failed to add faculty");
    }
  };

  // Cập nhật khoa
  const handleUpdateFaculty = async (updatedFaculty: Faculty) => {
    try {
      const token = getCookie("accessToken");
      await axios.patch(
        `http://localhost:3002/edit-major?id=${updatedFaculty._id}`,
        { name: updatedFaculty.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFaculties(
        faculties.map((faculty) =>
          faculty._id === updatedFaculty._id ? updatedFaculty : faculty
        )
      );
      setShowEditForm(false);
      toast.success("Faculty updated successfully");
    } catch (error) {
      console.error("Error updating faculty:", error);
      toast.error("Failed to update faculty");
    }
  };

  // Xóa khoa
  const handleDeleteFaculty = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this faculty?")) {
      try {
        const token = getCookie("accessToken");
        await axios.delete(`http://localhost:3002/delete-major?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFaculties(faculties.filter((faculty) => faculty._id !== id));
        toast.success("Faculty deleted successfully");
      } catch (error) {
        console.error("Error deleting faculty:", error);
        toast.error("Failed to delete faculty");
      }
    }
  };

  // Lọc dựa trên tìm kiếm
  const filteredFaculties = faculties.filter((faculty) =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="admin-heading">Faculty Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="admin-button-primary flex items-center"
            >
              <FaPlus className="mr-2" /> Add Faculty
            </button>
            <input
              type="text"
              placeholder="Search faculties..."
              className="admin-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Faculties List */}
        {isLoading ? (
          <div className="flex justify-center my-10">
            <div className="admin-spinner"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="admin-table-header">
                    Faculty Name
                  </th>
                  <th scope="col" className="admin-table-header text-right">
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
                          className="text-emerald-600 hover:text-emerald-900 mr-3"
                        >
                          <FaEdit className="inline text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(faculty._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                      No faculties found
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
