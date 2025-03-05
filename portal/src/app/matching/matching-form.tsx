import { useState } from "react";

export default function StaffForm() {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTutor, setSelectedTutor] = useState("");

  const students = ["John Doe", "Jane Smith", "Alice Brown"];
  const tutors = ["Mr. Anderson", "Ms. Johnson", "Dr. Williams"];

  const handleAssign = () => {
    if (selectedStudent && selectedTutor) {
      alert(`Assigned ${selectedTutor} to ${selectedStudent}`);
    } else {
      alert("Please select both a student and a tutor.");
    }
  };

  return (
    <div>
      {/* Select Student */}
      <select
        className="border p-2 w-full mb-2 text-black bg-white"
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
      >
        <option value="" disabled>Select Student</option>
        {students.map((student, index) => (
          <option key={index} value={student}>
            {student}
          </option>
        ))}
      </select>

      {/* Select Tutor */}
      <select
        className="border p-2 w-full mb-2 text-black bg-white"
        value={selectedTutor}
        onChange={(e) => setSelectedTutor(e.target.value)}
      >
        <option value="" disabled>Select Tutor</option>
        {tutors.map((tutor, index) => (
          <option key={index} value={tutor}>
            {tutor}
          </option>
        ))}
      </select>

      {/* Assign Button */}
      <button
        onClick={handleAssign}
        className="bg-blue-500 text-white px-4 py-2 w-full rounded-lg shadow-md hover:bg-blue-600 transition"
      >
        Assign Tutor
      </button>
    </div>
  );
}
