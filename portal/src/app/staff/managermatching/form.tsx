import React, { useState } from "react";

interface MatchingFormProps {
  onSubmit: (data: MatchingData) => void;
}

interface MatchingData {
  studentName: string;
  tutorName: string;
  subject: string;
  timeSlot: string;
  status: string;
}

const ManagerMatchingForm: React.FC<MatchingFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<MatchingData>({
    studentName: "",
    tutorName: "",
    subject: "",
    timeSlot: "",
    status: "Reserved",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ studentName: "", tutorName: "", subject: "", timeSlot: "", status: "Reserved" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-md bg-white">
      <div className="grid grid-cols-2 gap-4">
        <input 
          type="text" 
          name="studentName" 
          placeholder="Student Name" 
          value={formData.studentName} 
          onChange={handleChange} 
          className="border p-2 rounded w-full"
          required
        />
        <input 
          type="text" 
          name="tutorName" 
          placeholder="Tutor Name" 
          value={formData.tutorName} 
          onChange={handleChange} 
          className="border p-2 rounded w-full"
          required
        />
        <input 
          type="text" 
          name="subject" 
          placeholder="Subject" 
          value={formData.subject} 
          onChange={handleChange} 
          className="border p-2 rounded w-full"
          required
        />
        <input 
          type="text" 
          name="timeSlot" 
          placeholder="Time Slot" 
          value={formData.timeSlot} 
          onChange={handleChange} 
          className="border p-2 rounded w-full"
          required
        />
        <select 
          name="status" 
          value={formData.status} 
          onChange={handleChange} 
          className="border p-2 rounded w-full"
        >
          <option value="Reserved">Reserved</option>
          <option value="Studying">Studying</option>
        </select>
      </div>
      <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
    </form>
  );
};

export default ManagerMatchingForm;
