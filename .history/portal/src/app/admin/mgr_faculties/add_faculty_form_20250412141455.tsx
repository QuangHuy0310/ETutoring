import React, { useState } from "react";

interface AddFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (faculty: { name: string }) => void;
  lastId?: number; // Có thể không cần thiết nếu backend tự tạo ID
}

const AddFacultyModal: React.FC<AddFacultyModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [facultyName, setFacultyName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!facultyName.trim()) {
      setError("Faculty name is required");
      return;
    }
    
    onSave({ name: facultyName.trim() });
    
    // Đặt lại form và đóng form
    setFacultyName("");
    setError("");
    onClose(); // Thêm dòng này để đảm bảo form được đóng sau khi submit
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
        <h2 className="text-xl font-bold mb-4">Add New Faculty</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="facultyName" className="block mb-1 font-medium">
              Faculty Name
            </label>
            <input
              id="facultyName"
              type="text"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter faculty name"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFacultyModal;