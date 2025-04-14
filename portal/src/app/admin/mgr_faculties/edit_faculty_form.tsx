import React, { useState, useEffect } from "react";

interface Faculty {
  _id: string;
  name: string;
}

interface EditFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (faculty: Faculty) => void;
  faculty: Faculty;
}

const EditFacultyModal: React.FC<EditFacultyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  faculty,
}) => {
  const [facultyName, setFacultyName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (faculty) {
      setFacultyName(faculty.name);
    }
  }, [faculty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!facultyName.trim()) {
      setError("Faculty name is required");
      return;
    }
    
    onSave({ _id: faculty._id, name: facultyName.trim() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl text-black">
        <h2 className="text-xl font-bold mb-4 text-emerald-800 border-b pb-2">Edit Faculty</h2>
        
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
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFacultyModal;