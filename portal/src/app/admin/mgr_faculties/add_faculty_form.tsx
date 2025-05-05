import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getCookie } from "cookies-next";

interface AddFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (faculty: { _id: string; name: string }) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const AddFacultyModal: React.FC<AddFacultyModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [facultyName, setFacultyName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!facultyName.trim()) {
      setError("Faculty name is required");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    
    try {
      const token = getCookie("accessToken");
      // Using the correct API endpoint for adding new majors
      const response = await axios.post(
        `${API_URL}/new-major`,
        { name: facultyName.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data && response.data.data) {
        toast.success("Faculty added successfully");
        onSave(response.data.data);
        
        // Reset form
        setFacultyName("");
      } else {
        toast.warning("Faculty added but returned unexpected data format");
      }
    } catch (error) {
      console.error("Error adding faculty:", error);
      toast.error("Failed to add faculty");
      setError("Failed to add faculty. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-black shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-emerald-800 border-b pb-2">Add New Faculty</h2>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="mb-4">
            <label htmlFor="facultyName" className="block mb-1 font-medium text-gray-700">
              Faculty Name
            </label>
            <input
              id="facultyName"
              type="text"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter faculty name"
              disabled={isSubmitting}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFacultyModal;