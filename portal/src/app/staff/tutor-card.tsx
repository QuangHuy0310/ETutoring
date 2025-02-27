export default function TutorCard() {
  return (
    <div className="flex items-center border p-4 bg-white shadow-lg rounded-lg text-black">
      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
        📷
      </div>
      <div className="ml-4">
        <h3 className="font-bold">Tutor Name</h3>
        <p className="text-sm">Class: XYZ</p>
        <p className="text-sm">Subject: ABC</p>
        <p className="text-sm">Time: 10:00 AM</p>
        <p className="text-sm">Fee: $</p>
      </div>
    </div>
  );
}
