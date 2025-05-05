"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/app/admin/AdminLayout";
import AddAccountForm from "./add_acc_form";
import EditAccount from "./edit_acc";
import { getCookie } from "cookies-next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface User {
  id: number;
  name?: string;
  email: string;
  faculties?: string;
  role: string;
  password?: string;
}

const AccountManagerPage: React.FC = () => {
  // States
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Filtered users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name ? user.name.toLowerCase().includes(searchTerm.toLowerCase()) : false) || 
      (user.email ? user.email.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
    let matchesRole = true;
    if (selectedRole !== "all") {
      matchesRole = user.role === selectedRole;
    }
    
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  // Calculate page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Function to handle user deletion
  const deleteUser = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = getCookie("accessToken");
        
        if (!token) {
          toast.error("Authentication error. Please login again.");
          return;
        }

        const response = await axios.delete(`${API_URL}/api/v1/users/delete-user?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        // Update the UI after successful deletion
        setUsers(users.filter((user) => user.id !== id));
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("An error occurred while deleting the user");
      }
    }
  };
  
  // Function to handle user editing
  const editUser = (id: number) => {
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setIsEditAccountOpen(true);
    }
  };

  // Function to save edited user
  const handleSaveEditedUser = async (userId: number, updatedData: { email?: string; role?: string }) => {
    // Update UI state after successful API call in EditAccount component
    setUsers(users.map(user => 
      user.id === userId ? { ...user, ...updatedData } : user
    ));
  };

  // Function to handle creating a new account
  const createAccount = () => { 
    setIsAddAccountOpen(true);
  };

  // Function to handle submissions from add_acc_form
  const handleAddAccount = (userData: { email: string; password: string; role: string }) => {
    // The API call is handled in the AddAccountForm component
    // We just need to update the UI with the new user
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1,
      ...userData
    };
    
    setUsers([...users, newUser]);
  };

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getCookie('accessToken');
        
        if (!token) {
          console.error("Access token not found in cookies");
          return;
        }
        
        const response = await axios.get(`${API_URL}/api/v1/users/get-all-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        
        // Process the API response
        let userData = response.data;
        
        // Handle nested data structure if present
        if (userData.data) {
          userData = userData.data;
        } else if (userData.users) {
          userData = userData.users;
        } else if (userData.result) {
          userData = userData.result;
        }
        
        // Map API data to our User interface
        if (Array.isArray(userData)) {
          const validUsers = userData
            .filter((user: any) => user && user.email)
            .map((user: any) => ({
              id: user.id || user._id,
              name: user.name || user.username || user.fullName || "N/A",
              email: user.email,
              faculties: user.faculties || user.faculty || "N/A",
              role: user.role || "student",
            }));
          
          if (validUsers.length > 0) {
            setUsers(validUsers);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      }
    };
    
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Account Manager</h1>

        {/* Search and filter section */}
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row gap-2 w-full">
            {/* Search box */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
            
            {/* Role filter */}
            <div className="w-full md:w-auto">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={createAccount}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-full md:w-auto"
          >
            Create Account
          </button>
        </div>

        {/* Add Account Form Modal */}
        <AddAccountForm 
          open={isAddAccountOpen}
          onClose={() => setIsAddAccountOpen(false)}
          onSubmit={handleAddAccount}
          faculties={[
            { id: "1", name: "IT" },
            { id: "2", name: "Graphic" },
            { id: "3", name: "Business" },
          ]}
        />

        {/* Edit Account Modal */}
        {editingUser && (
          <EditAccount
            isOpen={isEditAccountOpen}
            onClose={() => setIsEditAccountOpen(false)}
            onSave={handleSaveEditedUser}
            userId={editingUser.id}
            currentName={editingUser.name || ""}
            currentEmail={editingUser.email || ""}
            currentRole={editingUser.role || "student"}
          />
        )}

        {/* User list table */}
        <div className="border rounded-lg p-4 bg-white text-black">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Faculties</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="text-center">
                    <td className="border p-2">{user.name || "N/A"}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">{user.faculties || "N/A"}</td>
                    <td className="border p-2">{user.role}</td>
                    <td className="border p-2">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => editUser(user.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          title="Edit user"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          title="Delete user"
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
                    {searchTerm ? "No matching users found" : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-center mt-4 space-x-1">
            {/* Previous button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              &laquo;
            </button>
            
            {/* First page if not in view */}
            {getPageNumbers()[0] > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  1
                </button>
                {getPageNumbers()[0] > 2 && (
                  <span className="px-3 py-1">...</span>
                )}
              </>
            )}
            
            {/* Page numbers */}
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            
            {/* Last page if not in view */}
            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <>
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                  <span className="px-3 py-1">...</span>
                )}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  {totalPages}
                </button>
              </>
            )}
            
            {/* Next button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              &raquo;
            </button>
          </div>
        )}

        <ToastContainer position="bottom-right" />
      </div>
    </AdminLayout>
  );
};

export default AccountManagerPage;
