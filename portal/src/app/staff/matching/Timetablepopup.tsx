import React from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const slots = ["8:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00", "17:00-19:00"];

interface TimetablePopupProps {
  userName: string;
  onClose: () => void;
  timetableData?: boolean[][]; // [slot][day]
}

const TimetablePopup: React.FC<TimetablePopupProps> = ({ userName, onClose, timetableData }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1E2432] text-white rounded-lg p-6 w-[600px] shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Timetable - {userName}</h2>
          <button className="text-gray-400 hover:text-white text-xl" onClick={onClose}>✖</button>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-gray-600 px-2 py-2 bg-[#2A4E89] text-left">Time</th>
              {days.map(day => (
                <th key={day} className="border border-gray-600 px-2 py-2 bg-[#2A4E89]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, rowIdx) => (
              <tr key={slot}>
                <td className="border border-gray-700 px-2 py-2">{slot}</td>
                {days.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className={`border border-gray-700 px-2 py-3 text-center ${
                      timetableData?.[rowIdx]?.[colIdx]
                        ? "bg-[#3A6AB4] text-white font-bold"
                        : "bg-[#0B0F19]"
                    }`}
                  >
                    {timetableData?.[rowIdx]?.[colIdx] ? "✔" : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetablePopup;
