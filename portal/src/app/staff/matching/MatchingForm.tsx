import React, { useState } from "react";

// Định nghĩa kiểu dữ liệu cho User (Student/Tutor)
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

// Định nghĩa kiểu props cho MatchingForm
interface MatchingFormProps {
  selectedStudent: User | null;
  selectedTutor: User | null;
  setSelectedStudent: (user: User | null) => void;
  setSelectedTutor: (user: User | null) => void;
}

const MatchingForm: React.FC<MatchingFormProps> = ({
  selectedStudent,
  selectedTutor,
  setSelectedStudent,
  setSelectedTutor,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div className="bg-[#1E2432] p-6 rounded-lg shadow-md flex flex-col items-center text-white">
      <h2 className="text-lg font-bold mb-4">Matching</h2>
      <div className="flex gap-6">
        {/* Student Slot */}
        <div className="flex flex-col items-center">
          <p className="font-semibold">Student</p>
          {selectedStudent ? (
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <img src={selectedStudent.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
              <p className="font-bold">{selectedStudent.name}</p>
              <p className="text-sm text-gray-500">{selectedStudent.email}</p>
              <button
                className="text-red-500 mt-2 text-sm"
                onClick={() => setSelectedStudent(null)}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 border flex items-center justify-center text-gray-400">
              Empty
            </div>
          )}
        </div>

        {/* Tutor Slot */}
        <div className="flex flex-col items-center">
          <p className="font-semibold">Tutor</p>
          {selectedTutor ? (
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <img src={selectedTutor.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
              <p className="font-bold">{selectedTutor.name}</p>
              <p className="text-sm text-gray-500">{selectedTutor.email}</p>
              <button
                className="text-red-500 mt-2 text-sm"
                onClick={() => setSelectedTutor(null)}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 border flex items-center justify-center text-gray-400">
              Empty
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={!selectedStudent || !selectedTutor}
          onClick={() => setIsConfirmOpen(true)}
        >
          Match
        </button>
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          onClick={() => {
            setSelectedStudent(null);
            setSelectedTutor(null);
          }}
        >
          Clear
        </button>
      </div>

      {/* Confirm Form (Matching) */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h3 className="text-lg font-bold mb-4 text-center">Confirm Matching</h3>
            <div className="flex justify-center gap-6 mb-4">
              {/* Student Info */}
              <div className="text-center">
                <img
                  src={selectedStudent?.avatar}
                  alt="Student Avatar"
                  className="w-16 h-16 rounded-full mx-auto border"
                />
                <p className="font-bold">{selectedStudent?.name}</p>
                <p className="text-sm text-gray-500">Student</p>
              </div>

              {/* Tutor Info */}
              <div className="text-center">
                <img
                  src={selectedTutor?.avatar}
                  alt="Tutor Avatar"
                  className="w-16 h-16 rounded-full mx-auto border"
                />
                <p className="font-bold">{selectedTutor?.name}</p>
                <p className="text-sm text-gray-500">Tutor</p>
              </div>
            </div>

            {/* Placeholder for large image (optional) */}
            <div className="w-full h-40 border flex items-center justify-center text-gray-400">
              Matching Preview
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setIsConfirmOpen(false)}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
                onClick={() => {
                  alert(`Matched: ${selectedStudent?.name} with ${selectedTutor?.name}`);
                  setIsConfirmOpen(false);
                  setSelectedStudent(null);
                  setSelectedTutor(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingForm;
