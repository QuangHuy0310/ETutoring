"use client";

import React, { useState } from "react";
import TimetablePopup from "./Timetablepopup";

interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MatchingFormProps {
  selectedStudents: User[];
  selectedTutor: User | null;
  setSelectedStudents: (users: User[]) => void;
  setSelectedTutor: (user: User | null) => void;
  onConfirmMatch: () => void;
}

const MatchingForm: React.FC<MatchingFormProps> = ({
  selectedStudents,
  selectedTutor,
  setSelectedStudents,
  setSelectedTutor,
  onConfirmMatch,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [openTimetableUser, setOpenTimetableUser] = useState<"student" | "tutor" | null>(null);

  return (
    <div className="bg-[#1E2432] p-6 rounded-lg shadow-md flex flex-col items-center text-white w-full">
      <h2 className="text-lg font-bold mb-4">Matching</h2>

      <div className="flex flex-col gap-6 w-full">
        {/* Students */}
        <div className="flex flex-col items-center">
          <p className="font-semibold">Students ({selectedStudents.length})</p>
          {selectedStudents.length > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {selectedStudents.map((student) => (
                <div key={student.id} className="flex flex-col items-center p-2 border rounded-lg">
                  <img src={student.avatar || "/default-avatar.png"} alt="Student Avatar" className="w-12 h-12 rounded-full" />
                  <p
                    className="text-xs font-bold cursor-pointer hover:underline"
                    onClick={() => setOpenTimetableUser("student")}
                  >
                    {student.name}
                  </p>
                  <button
                    className="text-red-500 text-xs mt-1"
                    onClick={() => setSelectedStudents(selectedStudents.filter((s) => s.id !== student.id))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-24 h-24 border flex items-center justify-center text-gray-400">Empty</div>
          )}
        </div>

        {/* Tutor */}
        <div className="flex flex-col items-center">
          <p className="font-semibold">Tutor</p>
          {selectedTutor ? (
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <img src={selectedTutor.avatar || "/default-avatar.png"} alt="Tutor Avatar" className="w-16 h-16 rounded-full" />
              <p
                className="font-bold cursor-pointer hover:underline"
                onClick={() => setOpenTimetableUser("tutor")}
              >
                {selectedTutor.name}
              </p>
              <p className="text-sm text-gray-400">{selectedTutor.email}</p>
              <button className="text-red-500 mt-2 text-sm" onClick={() => setSelectedTutor(null)}>
                Remove
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 border flex items-center justify-center text-gray-400">Empty</div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={selectedStudents.length === 0 || !selectedTutor}
          onClick={() => setIsConfirmOpen(true)}
        >
          Match
        </button>
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          onClick={() => {
            setSelectedStudents([]);
            setSelectedTutor(null);
          }}
        >
          Clear
        </button>
      </div>

      {/* Confirm Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] text-black">
            <h3 className="text-lg font-bold mb-4 text-center">Confirm Matching</h3>
            <div className="flex flex-col gap-2 mb-4">
              <div className="font-semibold">Students:</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedStudents.map((student) => (
                  <div key={student.id} className="flex flex-col items-center text-center w-24">
                    <img src={student.avatar || "/default-avatar.png"} alt="Student" className="w-12 h-12 rounded-full" />
                    <p className="text-xs">{student.name}</p>
                  </div>
                ))}
              </div>

              <div className="font-semibold mt-4">Tutor:</div>
              {selectedTutor && (
                <div className="flex flex-col items-center mt-2">
                  <img src={selectedTutor.avatar || "/default-avatar.png"} alt="Tutor" className="w-16 h-16 rounded-full" />
                  <p className="font-bold">{selectedTutor.name}</p>
                  <p className="text-sm text-gray-500">Tutor</p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setIsConfirmOpen(false)}>
                No
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
                onClick={() => {
                  onConfirmMatch();
                  setIsConfirmOpen(false);
                  setSelectedStudents([]);
                  setSelectedTutor(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Popup */}
      {openTimetableUser && (
        <TimetablePopup
          userName={
            openTimetableUser === "student"
              ? selectedStudents[0]?.name || ""
              : selectedTutor?.name || ""
          }
          onClose={() => setOpenTimetableUser(null)}
        />
      )}
    </div>
  );
};

export default MatchingForm;
